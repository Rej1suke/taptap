import { ApiError, allowedKeys, stringField } from "@/lib/api";
import { MAX_TABLE_NUMBER, ORDER_TYPES, isOneOf, isOrderToken, type OrderType } from "./types";

export interface RequestedOrderItem {
  variantId: string;
  quantity: number;
  addonVariantIds: string[];
}

export interface CreateOrderInput {
  requestId: string;
  orderType: OrderType;
  tableNumber: number | null;
  items: RequestedOrderItem[];
}

const MAX_ADDONS_PER_LINE = 10;

function variantIdField(value: unknown, field: string): string {
  const variantId = stringField(value, field, 120);
  if (!/^[a-zA-Z0-9_-]+$/.test(variantId)) {
    throw new ApiError(400, "VALIDATION_ERROR", `${field} is invalid.`);
  }
  return variantId;
}

function parseAddonIds(value: unknown, index: number): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_ADDONS_PER_LINE) {
    throw new ApiError(400, "VALIDATION_ERROR", `items[${index}].addonVariantIds must list at most ${MAX_ADDONS_PER_LINE} add-ons.`);
  }
  const addonIds = value.map((addonId, addonIndex) => variantIdField(addonId, `items[${index}].addonVariantIds[${addonIndex}]`));
  if (new Set(addonIds).size !== addonIds.length) {
    throw new ApiError(400, "VALIDATION_ERROR", "Each add-on may be chosen once per drink.");
  }
  return addonIds.sort();
}

export function parseCreateOrder(body: Record<string, unknown>): CreateOrderInput {
  allowedKeys(body, ["requestId", "orderType", "tableNumber", "paymentMethod", "items"]);
  const requestId = stringField(body.requestId, "requestId", 36);
  if (!isOrderToken(requestId)) {
    throw new ApiError(400, "VALIDATION_ERROR", "requestId must be a valid UUID.");
  }

  const orderType = body.orderType ?? "dine_in";
  if (!isOneOf(ORDER_TYPES, orderType)) {
    throw new ApiError(400, "VALIDATION_ERROR", "orderType must be dine_in or takeout.");
  }

  const tableNumber = body.tableNumber ?? null;
  if (tableNumber !== null && (typeof tableNumber !== "number" || !Number.isSafeInteger(tableNumber) || tableNumber < 1 || tableNumber > MAX_TABLE_NUMBER)) {
    throw new ApiError(400, "VALIDATION_ERROR", `tableNumber must be a whole number from 1 to ${MAX_TABLE_NUMBER}.`);
  }

  const paymentMethod = body.paymentMethod ?? "counter";
  if (paymentMethod !== "counter") {
    throw new ApiError(400, "PAYMENT_UNAVAILABLE", "Online payment isn’t available yet. Please choose pay at the counter.");
  }

  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    throw new ApiError(400, "VALIDATION_ERROR", "Add between 1 and 50 items to your order.");
  }

  const seen = new Set<string>();
  const items = body.items.map((value: unknown, index): RequestedOrderItem => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new ApiError(400, "VALIDATION_ERROR", `items[${index}] must be an object.`);
    }
    const record = value as Record<string, unknown>;
    allowedKeys(record, ["variantId", "quantity", "addonVariantIds"]);
    const variantId = variantIdField(record.variantId, `items[${index}].variantId`);
    const addonVariantIds = parseAddonIds(record.addonVariantIds, index);
    if (addonVariantIds.includes(variantId)) {
      throw new ApiError(400, "VALIDATION_ERROR", `items[${index}] cannot be its own add-on.`);
    }
    // The same drink may appear twice only with a different set of add-ons.
    const lineKey = [variantId, ...addonVariantIds].join("+");
    if (seen.has(lineKey)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Combine identical items into one line.");
    }
    seen.add(lineKey);
    if (typeof record.quantity !== "number" || !Number.isSafeInteger(record.quantity) || record.quantity < 1 || record.quantity > 20) {
      throw new ApiError(400, "VALIDATION_ERROR", `items[${index}].quantity must be a whole number from 1 to 20.`);
    }
    return { variantId, quantity: record.quantity, addonVariantIds };
  });

  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  if (totalQuantity > 100) {
    throw new ApiError(400, "VALIDATION_ERROR", "An order cannot contain more than 100 items.");
  }
  return { requestId, orderType, tableNumber, items };
}
