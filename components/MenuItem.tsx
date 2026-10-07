import Image from "next/image";
import type { ReactElement } from "react";
import type { MenuItem as MenuItemData, MenuVariant } from "@/lib/menu/types";

const priceFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency", currency: "PHP", minimumFractionDigits: 0, maximumFractionDigits: 2,
});

function variantLabel(variant: MenuVariant, hasMultiple: boolean): string | null {
  const temperature = variant.temperature === "iced" ? "Iced" : variant.temperature === "hot" ? "Hot" : null;
  const name = variant.name.toLowerCase() === "standard" ? null : variant.name;
  const size = variant.sizeOz === null ? null : `${variant.sizeOz} oz`;
  return [temperature ?? name, size].filter(Boolean).join(" · ") || (hasMultiple ? "Standard" : null);
}

export default function MenuItem({ item }: { item: MenuItemData }): ReactElement {
  return (
    <li className="menu-item">
      <div className="menu-item-main">
        {item.pictureUrl ? <Image src={item.pictureUrl} alt="" width={64} height={64} className="menu-item-image" unoptimized /> : null}
        <div className="menu-item-copy">
          <h3>{item.name}</h3>
          {item.description ? <p className="menu-description">{item.description}</p> : null}
          {item.process ? <p className="menu-process">{item.process}</p> : null}
          {item.roaster ? <p className="menu-roaster">Roasted by <span>{item.roaster}</span></p> : null}
        </div>
        <dl className="menu-prices">
          {item.variants.map((variant) => {
            const label = variantLabel(variant, item.variants.length > 1);
            return <div className="menu-price" key={variant.id}>
              <dt className={label ? "menu-price-label" : "menu-sr-only"}>{label ?? "Price"}</dt>
              <dd>{variant.priceKind === "surcharge" ? "+" : ""}{priceFormatter.format(variant.priceCentavos / 100)}</dd>
            </div>;
          })}
        </dl>
      </div>
    </li>
  );
}
