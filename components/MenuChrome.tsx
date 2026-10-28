import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import brandLogo from "@/public/nuwave.png";

export function MenuHeader({ tableNumber }: { tableNumber: number | null }): ReactElement {
  return (
    <header className="menu-header">
      <Link href={tableNumber === null ? "/" : `/?table=${tableNumber}`} className="menu-header-brand" aria-label="Ñuwave Specialty Coffee home">
        <span className="menu-brand-mark">
          <Image src={brandLogo} alt="" sizes="120px" priority />
        </span>
      </Link>
      <div className="menu-header-title">
        <h1>Menu</h1>
        <p>{tableNumber === null ? "Order here, pay at the counter" : `Table ${tableNumber} · Order here, pay at the counter`}</p>
      </div>
    </header>
  );
}

export function MenuFooter(): ReactElement {
  return (
    <footer className="menu-footer">
      <div>
        <p className="menu-footer-brand">Ñuwave Specialty Coffee</p>
        <p>Corner Fajardo &amp; Libertad Street, Iloilo City · Prices in Philippine pesos</p>
      </div>
      <div className="menu-footer-links">
        <a href="https://www.instagram.com/nuwavecoffeeph/" target="_blank" rel="noreferrer">Instagram <span className="menu-sr-only">(opens a new tab)</span></a>
        <a href="https://www.facebook.com/p/%C3%91uwave-Coffee-61556594862390/" target="_blank" rel="noreferrer">Facebook <span className="menu-sr-only">(opens a new tab)</span></a>
      </div>
    </footer>
  );
}
