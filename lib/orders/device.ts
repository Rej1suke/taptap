import { isOrderToken, type PublicOrder } from "./types";

/** A placed order remembered on this phone so "My Orders" works without an account. */
export interface DeviceOrder {
  token: string;
  orderNumber: string;
  totalCentavos: number;
  createdAt: string;
  summary: string;
}

const STORAGE_KEY = "nuwave.orders.v1";
const MAX_REMEMBERED = 20;

function isDeviceOrder(value: unknown): value is DeviceOrder {
  return typeof value === "object" && value !== null &&
    "token" in value && typeof value.token === "string" && isOrderToken(value.token) &&
    "orderNumber" in value && typeof value.orderNumber === "string" &&
    "totalCentavos" in value && typeof value.totalCentavos === "number" &&
    "createdAt" in value && typeof value.createdAt === "string" &&
    "summary" in value && typeof value.summary === "string";
}

export function readDeviceOrders(): DeviceOrder[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isDeviceOrder) : [];
  } catch {
    return [];
  }
}

export function rememberOrder(token: string, order: PublicOrder): void {
  const entry: DeviceOrder = {
    token,
    orderNumber: order.orderNumber,
    totalCentavos: order.totalCentavos,
    createdAt: order.createdAt,
    summary: order.lines.map((line) => line.quantity > 1 ? `${line.quantity}× ${line.name}` : line.name).join(", "),
  };
  try {
    const others = readDeviceOrders().filter((existing) => existing.token !== token);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...others].slice(0, MAX_REMEMBERED)));
  } catch {
    // Private browsing or full storage: the status link still works for this visit.
  }
}
