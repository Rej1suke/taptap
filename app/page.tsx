import { Suspense, type ReactElement } from "react";
import Image from "next/image";
import CategoryNav from "@/components/CategoryNav";
import MenuItem from "@/components/MenuItem";
import { getPublicMenu } from "@/lib/menu/repository";
import type { MenuResponse } from "@/lib/menu/types";
import brandLogo from "@/public/nuwave.png";

export const dynamic = "force-dynamic";

async function MenuContents(): Promise<ReactElement> {
  let menu: MenuResponse;
  try {
    menu = await getPublicMenu();
  } catch {
    return (
      <section className="menu-state" aria-labelledby="menu-error-title">
        <h2 id="menu-error-title">The menu couldn’t load.</h2>
        <p>Please try again, or ask our barista for today’s menu.</p>
        <form action="/" method="get"><button className="menu-action" type="submit">Try again</button></form>
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
  return (
    <>
      <CategoryNav categories={menu.categories.map(({ id, name }) => ({ id, name }))} />
      <div id="menu-list" className="menu-grid">
        {menu.categories.map((category) => {
          const isSpecialty = category.items.some((item) => item.roaster !== null || item.process !== null);
          const isAddon = category.items.length > 0 && category.items.every((item) => item.itemType === "addon");
          return (
            <section key={category.id} id={category.id}
              className={`menu-section${isSpecialty ? " menu-section-specialty" : ""}${isAddon ? " menu-section-addons" : ""}`}
              aria-labelledby={`${category.id}-title`} tabIndex={-1}>
              <div className="menu-section-heading">
                <h2 id={`${category.id}-title`}>{category.name}</h2>
                {isSpecialty ? <p>Origins, processes & the people who roast them.</p> : null}
              </div>
              {category.items.length > 0 ? (
                <ul className="menu-items">
                  {category.items.map((item) => <MenuItem key={item.id} item={item} />)}
                </ul>
              ) : <p className="menu-section-empty">Ask our barista what’s available.</p>}
            </section>
          );
        })}
      </div>
    </>
  );
}

export default function Home(): ReactElement {
  return (
    <main id="top" className="menu-page">
      <a className="menu-skip" href="#menu-list">Skip to the menu</a>
      <div className="menu-paper">
        <header className="menu-masthead">
          <a className="menu-brand" href="#top" aria-label="Ñuwave Specialty Coffee, top of menu">
            <span className="menu-brand-mark">
              <Image src={brandLogo} alt="Ñuwave Specialty Coffee" sizes="(max-width: 600px) 207px, (max-width: 800px) 288px, 391px" loading="eager" />
            </span>
          </a>
          <div className="menu-title-block">
            <h1>THE MENU</h1>
            <p>Don’t just drink coffee, experience it.</p>
          </div>
          <div className="menu-masthead-foot">
            <p>Corner Fajardo & Libertad Street, Iloilo City</p>
            <p>All prices in Philippine pesos</p>
          </div>
        </header>
        <Suspense fallback={<div className="menu-state" role="status" aria-live="polite">
          <h2>Getting the menu ready.</h2><p>Loading drinks, coffee & something to eat…</p>
        </div>}><MenuContents /></Suspense>
        <footer className="menu-footer">
          <div>
            <a className="menu-footer-brand" href="#top">Ñuwave Specialty Coffee</a>
            <p>Corner Fajardo & Libertad Street, Iloilo City</p>
          </div>
          <div className="menu-footer-links">
            <a href="https://www.instagram.com/nuwavecoffeeph/" target="_blank" rel="noreferrer">Instagram <span className="menu-sr-only">(opens a new tab)</span></a>
            <a href="https://www.facebook.com/p/%C3%91uwave-Coffee-61556594862390/" target="_blank" rel="noreferrer">Facebook <span className="menu-sr-only">(opens a new tab)</span></a>
            <a href="#top">Back to top</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
