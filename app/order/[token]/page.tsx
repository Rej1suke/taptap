import type { ReactElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import OrderStatus from "@/components/OrderStatus";
import { getOrderByToken } from "@/lib/orders/store";
import { isOrderToken, menuHref, parseTableNumber, type PublicOrder } from "@/lib/orders/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order · ÑUWAVE Specialty Coffee",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<ReactElement> {
  const { token } = await params;
  const query = await searchParams;
  const tableNumber = parseTableNumber(query.table);

  let order: PublicOrder | null = null;
  let failed = false;
  if (isOrderToken(token)) {
    try {
      order = await getOrderByToken(token);
    } catch {
      failed = true;
    }
  }

  if (!order) {
    return (
      <main className="order-page">
        <section className="order-card order-state">
          <h1>{failed ? "We couldn’t load your order." : "We couldn’t find that order."}</h1>
          <p>{failed ? "Please try again in a moment, or show your order number at the counter." : "Check the link, or ask our cashier for help."}</p>
          <Link className="kiosk-place-order" href={menuHref(tableNumber)}>Back to menu</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="order-page">
      <OrderStatus token={token} initialOrder={order} justPlaced={query.placed === "1"} tableNumber={tableNumber} />
    </main>
  );
}
