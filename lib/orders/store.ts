import "server-only";
import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import { ApiError } from "@/lib/api";
import {
  ORDER_STATUSES, ORDER_TYPES, PAYMENT_METHODS, isOneOf,
  type PublicOrder, type PublicOrderLine,
} from "./types";
import type { CreateOrderInput } from "./validation";

interface AvailableVariant {
  id: string;
  itemId: string;
  itemName: string;
  itemType: "beverage" | "food" | "addon";
  variantName: string;
  temperature: string | null;
  sizeOz: number | null;
  priceCentavos: number;
}

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  tableNumber: number | null;
  paymentMethod: string;
  totalCentavos: number;
  createdAt: Date;
}

interface OrderItemRow {
  id: string;
  parentItemId: string | null;
  itemName: string;
  variantLabel: string;
  quantity: number;
  unitPriceCentavos: number;
  lineTotalCentavos: number;
}

interface OrderItemInsert {
  id: string;
  parentItemId: string | null;
  variant: AvailableVariant;
  quantity: number;
  lineTotalCentavos: number;
}

const MAX_TOTAL_CENTAVOS = 2_147_483_647;
const UNAVAILABLE = "One or more items are no longer available. Refresh the menu and try again.";

declare global {
  var kioskOrderPool: Pool | undefined;
}

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new ApiError(503, "ORDERING_UNAVAILABLE", "Ordering is not configured yet.");
  }
  globalThis.kioskOrderPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  });
  return globalThis.kioskOrderPool;
}

function variantLabel(variant: AvailableVariant): string {
  const temperature = variant.temperature === "iced" ? "Iced" : variant.temperature === "hot" ? "Hot" : null;
  const standard = variant.variantName.toLowerCase() === "standard" ? null : variant.variantName;
  const size = variant.sizeOz === null ? null : `${variant.sizeOz} oz`;
  return [temperature ?? standard, size].filter(Boolean).join(" · ") || "Standard";
}

function checkedTotal(value: number): number {
  if (!Number.isSafeInteger(value) || value > MAX_TOTAL_CENTAVOS) {
    throw new ApiError(400, "ORDER_TOO_LARGE", "The order total is too large.");
  }
  return value;
}

function toPublicOrder(order: OrderRow, items: OrderItemRow[]): PublicOrder {
  if (!isOneOf(ORDER_STATUSES, order.status) || !isOneOf(ORDER_TYPES, order.orderType) || !isOneOf(PAYMENT_METHODS, order.paymentMethod)) {
    throw new Error("Stored order has an unrecognized status, type, or payment method.");
  }
  const lines = new Map<string, PublicOrderLine>();
  for (const item of items) {
    if (item.parentItemId !== null) continue;
    lines.set(item.id, {
      name: item.itemName,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
      unitPriceCentavos: item.unitPriceCentavos,
      lineTotalCentavos: item.lineTotalCentavos,
      addons: [],
    });
  }
  for (const item of items) {
    const parent = item.parentItemId === null ? undefined : lines.get(item.parentItemId);
    if (!parent) continue;
    parent.addons.push({ name: item.itemName, unitPriceCentavos: item.unitPriceCentavos });
    parent.lineTotalCentavos += item.lineTotalCentavos;
  }
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    orderType: order.orderType,
    tableNumber: order.tableNumber,
    paymentMethod: order.paymentMethod,
    totalCentavos: order.totalCentavos,
    createdAt: order.createdAt.toISOString(),
    lines: [...lines.values()],
  };
}

async function loadOrder(client: Pool | PoolClient, requestId: string): Promise<PublicOrder | null> {
  const orderResult = await client.query<OrderRow>(
    `SELECT id, "orderNumber"::text AS "orderNumber", status, "orderType", "tableNumber",
       "paymentMethod", "totalCentavos", "createdAt"
     FROM public."KioskOrder"
     WHERE "requestId" = $1`,
    [requestId],
  );
  const order = orderResult.rows[0];
  if (!order) return null;
  const itemsResult = await client.query<OrderItemRow>(
    `SELECT id, "parentItemId", "itemName", "variantLabel", quantity, "unitPriceCentavos", "lineTotalCentavos"
     FROM public."KioskOrderItem"
     WHERE "orderId" = $1
     ORDER BY "position"`,
    [order.id],
  );
  return toPublicOrder(order, itemsResult.rows);
}

/** Looks up an order by the private request token kept on the customer's device. */
export async function getOrderByToken(requestId: string): Promise<PublicOrder | null> {
  return loadOrder(getPool(), requestId);
}

export async function placeOrder(input: CreateOrderInput): Promise<PublicOrder> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const previous = await loadOrder(client, input.requestId);
    if (previous) {
      await client.query("COMMIT");
      return previous;
    }

    const variantIds = [...new Set(input.items.flatMap((item) => [item.variantId, ...item.addonVariantIds]))];
    const variantsResult = await client.query<AvailableVariant>(
      `SELECT v.id, v."itemId", i.name AS "itemName", i."itemType",
        v.name AS "variantName", v.temperature, v."sizeOz", v."priceCentavos"
       FROM public."MenuVariant" v
       JOIN public."MenuItem" i ON i.id = v."itemId"
       JOIN public."MenuCategory" c ON c.id = i."categoryId"
       WHERE v.id = ANY($1::text[])
         AND i.active = true AND c.active = true
         AND v.available IS DISTINCT FROM false`,
      [variantIds],
    );
    const variants = new Map(variantsResult.rows.map((variant) => [variant.id, variant]));
    if (variants.size !== variantIds.length) {
      throw new ApiError(409, "ITEM_UNAVAILABLE", UNAVAILABLE);
    }

    const inserts: OrderItemInsert[] = [];
    for (const requested of input.items) {
      const main = variants.get(requested.variantId);
      if (!main) throw new ApiError(409, "ITEM_UNAVAILABLE", UNAVAILABLE);
      if (main.itemType === "addon") {
        throw new ApiError(400, "VALIDATION_ERROR", "Add-ons must be ordered with a drink.");
      }
      const mainId = randomUUID();
      inserts.push({ id: mainId, parentItemId: null, variant: main, quantity: requested.quantity, lineTotalCentavos: checkedTotal(main.priceCentavos * requested.quantity) });
      for (const addonId of requested.addonVariantIds) {
        const addon = variants.get(addonId);
        if (!addon) throw new ApiError(409, "ITEM_UNAVAILABLE", UNAVAILABLE);
        if (addon.itemType !== "addon" || main.itemType !== "beverage") {
          throw new ApiError(400, "VALIDATION_ERROR", "Only add-ons can be added, and only to drinks.");
        }
        inserts.push({ id: randomUUID(), parentItemId: mainId, variant: addon, quantity: requested.quantity, lineTotalCentavos: checkedTotal(addon.priceCentavos * requested.quantity) });
      }
    }
    const totalCentavos = checkedTotal(inserts.reduce((total, line) => total + line.lineTotalCentavos, 0));

    const orderId = randomUUID();
    const inserted = await client.query(
      `INSERT INTO public."KioskOrder"
        (id, "requestId", "totalCentavos", status, "orderType", "tableNumber", "paymentMethod")
       VALUES ($1, $2, $3, 'placed', $4, $5, 'counter')
       ON CONFLICT ("requestId") DO NOTHING`,
      [orderId, input.requestId, totalCentavos, input.orderType, input.tableNumber],
    );
    if (inserted.rowCount === 0) {
      await client.query("COMMIT");
      const existing = await loadOrder(client, input.requestId);
      if (!existing) throw new Error("Idempotent order was not available after conflict.");
      return existing;
    }

    for (const [position, line] of inserts.entries()) {
      await client.query(
        `INSERT INTO public."KioskOrderItem"
          (id, "orderId", "parentItemId", "position", "itemId", "itemName", "itemType", "variantId",
           "variantLabel", quantity, "unitPriceCentavos", "lineTotalCentavos")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          line.id, orderId, line.parentItemId, position, line.variant.itemId, line.variant.itemName,
          line.variant.itemType, line.variant.id, variantLabel(line.variant), line.quantity,
          line.variant.priceCentavos, line.lineTotalCentavos,
        ],
      );
    }

    const order = await loadOrder(client, input.requestId);
    await client.query("COMMIT");
    if (!order) throw new Error("Placed order was not readable inside its transaction.");
    return order;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
