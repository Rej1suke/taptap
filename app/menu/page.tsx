import { Suspense, type ReactElement } from "react";
import KioskMenu from "@/components/KioskMenu";
import { MenuFooter, MenuHeader } from "@/components/MenuChrome";
import { getPublicMenu } from "@/lib/menu/repository";
import type { MenuResponse } from "@/lib/menu/types";
import { parseTableNumber } from "@/lib/orders/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function MenuContents({ tableNumber }: { tableNumber: number | null }): Promise<ReactElement> {
  let menu: MenuResponse;
  try {
    menu = await getPublicMenu();
  } catch {
    return (
      <section className="menu-state" aria-labelledby="menu-error-title">
        <h2 id="menu-error-title">The menu couldn’t load.</h2>
        <p>Please try again, or ask our barista for today’s menu.</p>
        <form action="/menu" method="get">
          {tableNumber !== null ? <input type="hidden" name="table" value={tableNumber} /> : null}
          <button className="menu-action" type="submit">Try again</button>
        </form>
      </section>
    );
  }
  if (menu.categories.length === 0) {
    return (
      <section className="menu-state" aria-labelledby="menu-empty-title">
        <h2 id="menu-empty-title">We’re updating the menu.</h2>
        <p>Ask our barista what’s available today.</p>
      </section>
    );
  }
  return <KioskMenu menu={menu} tableNumber={tableNumber} />;
}

export default async function MenuPage({ searchParams }: { searchParams: SearchParams }): Promise<ReactElement> {
  const tableNumber = parseTableNumber((await searchParams).table);
  return (
    <main id="top" className="menu-page">
      <a className="menu-skip" href="#menu-list">Skip to the menu</a>
      <MenuHeader tableNumber={tableNumber} />
      <Suspense fallback={<div className="menu-state" role="status" aria-live="polite">
        <h2>Getting the menu ready.</h2><p>Loading drinks, coffee &amp; something to eat…</p>
      </div>}><MenuContents tableNumber={tableNumber} /></Suspense>
      <MenuFooter />
    </main>
  );
}
