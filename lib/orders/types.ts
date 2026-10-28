export const ORDER_STATUSES = ["placed", "preparing", "ready", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_TYPES = ["dine_in", "takeout"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const PAYMENT_METHODS = ["counter", "online"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const MAX_TABLE_NUMBER = 99;

export interface PublicOrderAddon {
  name: string;
  unitPriceCentavos: number;
}

export interface PublicOrderLine {
  name: string;
  variantLabel: string;
  quantity: number;
  unitPriceCentavos: number;
  lineTotalCentavos: number;
  addons: PublicOrderAddon[];
}

/** What the customer may see about their own order, looked up by its private request token. */
export interface PublicOrder {
  orderNumber: string;
  status: OrderStatus;
  orderType: OrderType;
  tableNumber: number | null;
  paymentMethod: PaymentMethod;
  totalCentavos: number;
  createdAt: string;
  lines: PublicOrderLine[];
}

const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isOrderToken(value: string): boolean {
  return TOKEN_PATTERN.test(value);
}

/** Table numbers arrive from the NFC tag URL (`?table=4`); anything else is ignored. */
export function parseTableNumber(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || !/^\d{1,2}$/.test(raw)) return null;
  const table = Number(raw);
  return table >= 1 && table <= MAX_TABLE_NUMBER ? table : null;
}

export function menuHref(tableNumber: number | null): string {
  return tableNumber === null ? "/menu" : `/menu?table=${tableNumber}`;
}

export function isOneOf<T extends string>(values: readonly T[], value: unknown): value is T {
  return values.some((candidate) => candidate === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAddon(value: unknown): value is PublicOrderAddon {
  return isRecord(value) && typeof value.name === "string" && typeof value.unitPriceCentavos === "number";
}

function isLine(value: unknown): value is PublicOrderLine {
  return isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.variantLabel === "string" &&
    typeof value.quantity === "number" &&
    typeof value.unitPriceCentavos === "number" &&
    typeof value.lineTotalCentavos === "number" &&
    Array.isArray(value.addons) && value.addons.every(isAddon);
}

export function isPublicOrder(value: unknown): value is PublicOrder {
  return isRecord(value) &&
    typeof value.orderNumber === "string" &&
    isOneOf(ORDER_STATUSES, value.status) &&
    isOneOf(ORDER_TYPES, value.orderType) &&
    (value.tableNumber === null || typeof value.tableNumber === "number") &&
    isOneOf(PAYMENT_METHODS, value.paymentMethod) &&
    typeof value.totalCentavos === "number" &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.lines) && value.lines.every(isLine);
}

export const priceFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(priceCentavos: number): string {
  return priceFormatter.format(priceCentavos / 100);
}
