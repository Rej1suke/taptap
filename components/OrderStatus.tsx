"use client";

import { useEffect, useState, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import brandLogo from "@/public/nuwave.png";
import { rememberOrder } from "@/lib/orders/device";
import { formatPrice, isPublicOrder, menuHref, type OrderStatus as Status, type PublicOrder } from "@/lib/orders/types";

const POLL_INTERVAL_MS = 10_000;

const STEPS: Array<{ label: string; reachedAt: Status[] }> = [
  { label: "Order placed", reachedAt: ["placed", "preparing", "ready", "completed"] },
  { label: "Pay at the counter", reachedAt: ["preparing", "ready", "completed"] },
  { label: "Preparing", reachedAt: ["preparing", "ready", "completed"] },
  { label: "Ready for pickup", reachedAt: ["ready", "completed"] },
  { label: "Completed", reachedAt: ["completed"] },
];

const HEADLINES: Record<Status, string> = {
  placed: "Pay at the counter",
  preparing: "We’re making your order",
  ready: "Your order is ready",
  completed: "Order complete",
  cancelled: "Order cancelled",
};

// The one thing to do next, said under the headline.
const SUBLINES: Record<Status, string> = {
  placed: "Show your order number at the counter and pay. We start preparing once you’ve paid.",
  preparing: "Paid, thank you. Your drinks are with the barista now.",
  ready: "Pick it up at the counter. Your table beeper will buzz too.",
  completed: "Thanks for visiting Ñuwave. Enjoy!",
  cancelled: "This order won’t be prepared. Please ask our cashier if you think this is a mistake.",
};

function CheckIcon({ className }: { className?: string }): ReactElement {
  return (
    <svg className={className} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isFinished(status: Status): boolean {
  return status === "completed" || status === "cancelled";
}

function orderFrom(value: unknown): PublicOrder | null {
  const order = typeof value === "object" && value !== null && "order" in value ? value.order : null;
  return isPublicOrder(order) ? order : null;
}

export default function OrderStatus({
  token,
  initialOrder,
  justPlaced,
  tableNumber,
}: {
  token: string;
  initialOrder: PublicOrder;
  justPlaced: boolean;
  tableNumber: number | null;
}): ReactElement {
  const [order, setOrder] = useState(initialOrder);
  const [offline, setOffline] = useState(false);
  const finished = isFinished(order.status);
  const timeFormatter = new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit" });
  const backToMenu = menuHref(order.tableNumber ?? tableNumber);

  // Opening a shared or bookmarked status link also adds it to this phone's order list.
  useEffect(() => {
    rememberOrder(token, initialOrder);
  }, [token, initialOrder]);

  // Live status until the order is finished; Supabase Realtime can replace this later.
  useEffect(() => {
    if (finished) return;
    let cancelled = false;
    const refresh = async (): Promise<void> => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch(`/api/orders/${token}`, { cache: "no-store" });
        const next = response.ok ? orderFrom(await response.json()) : null;
        if (cancelled) return;
        setOffline(next === null);
        if (next) setOrder(next);
      } catch {
        if (!cancelled) setOffline(true);
      }
    };
    const timer = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    const onVisible = (): void => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token, finished]);

  const placedNow = justPlaced && order.status === "placed";

  return (
    <article className="order-card">
      <Link href={backToMenu} className="order-brand" aria-label="Ñuwave Specialty Coffee menu">
        <span className="menu-brand-mark">
          <Image src={brandLogo} alt="" sizes="120px" priority />
        </span>
      </Link>
      <header className="order-heading">
        {placedNow ? <CheckIcon className="order-check" /> : null}
        <h1>{placedNow ? "Order placed" : HEADLINES[order.status]}</h1>
        <p>{SUBLINES[order.status]}</p>
      </header>

      <section className="order-number" aria-label="Your order">
        <div>
          <p className="order-number-label">Order number</p>
          <p className="order-number-value">#{order.orderNumber}</p>
          <p className="order-number-meta">
            {order.orderType === "dine_in" ? "Dine-in" : "Takeout"}
            {order.tableNumber !== null ? ` · Table ${order.tableNumber}` : ""}
            {" · "}{timeFormatter.format(new Date(order.createdAt))}
          </p>
        </div>
        <div className="order-number-due">
          <p className="order-number-label">{order.status === "placed" ? "To pay" : order.status === "cancelled" ? "Total" : "Paid"}</p>
          <p className="order-number-amount">{formatPrice(order.totalCentavos)}</p>
        </div>
      </section>

      {order.status === "cancelled" ? null : (
        <ol className="order-steps" aria-label="Order progress">
          {STEPS.map((step, index) => {
            const done = step.reachedAt.includes(order.status);
            const current = !done && (index === 0 || STEPS[index - 1].reachedAt.includes(order.status));
            return (
              <li key={step.label} className={done ? "is-done" : current ? "is-current" : ""} aria-current={current ? "step" : undefined}>
                <span className="order-step-dot" aria-hidden="true">{done ? <CheckIcon /> : null}</span>
                <span>{step.label}</span>
              </li>
            );
          })}
        </ol>
      )}

      {!finished ? (
        <p className="order-live-note" role="status">
          {offline ? "Can’t reach the cafe right now. We’ll keep trying." : "This page updates on its own, so keep it open."}
        </p>
      ) : null}

      <section className="order-summary" aria-labelledby="order-summary-title">
        <h2 id="order-summary-title">Order summary</h2>
        <ul>
          {order.lines.map((line, index) => (
            <li key={`${line.name}-${index}`}>
              <div>
                <strong>{line.quantity > 1 ? `${line.quantity}× ` : ""}{line.name}</strong>
                <span>{[line.variantLabel === "Standard" ? null : line.variantLabel, ...line.addons.map((addon) => addon.name)].filter(Boolean).join(" · ")}</span>
              </div>
              <span>{formatPrice(line.lineTotalCentavos)}</span>
            </li>
          ))}
        </ul>
        <div className="kiosk-cart-total">
          <span>Total</span>
          <strong>{formatPrice(order.totalCentavos)}</strong>
        </div>
      </section>

      <Link className="order-secondary" href={backToMenu}>Back to menu</Link>
    </article>
  );
}
