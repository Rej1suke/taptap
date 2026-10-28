"use client";

import Image from "next/image";
import type { ReactElement } from "react";
import type { MenuItem as MenuItemData, MenuVariant } from "@/lib/menu/types";
import { formatPrice } from "@/lib/orders/types";

function priceLabel(variant: MenuVariant, hasMultiple: boolean): string | null {
  if (!hasMultiple) return null;
  if (variant.temperature === "iced") return "Iced";
  if (variant.temperature === "hot") return "Hot";
  return variant.name.toLowerCase() === "standard" ? null : variant.name;
}

export default function MenuItem({
  item,
  onCustomize,
}: {
  item: MenuItemData;
  onCustomize: (item: MenuItemData) => void;
}): ReactElement {
  const hasMultiple = item.variants.length > 1;
  const lowest = Math.min(...item.variants.map((variant) => variant.priceCentavos));

  return (
    <li className="menu-item">
      <button
        type="button"
        className="menu-item-button"
        onClick={() => onCustomize(item)}
        aria-label={`${item.name}, from ${formatPrice(lowest)}. Choose options`}
      >
        {item.pictureUrl ? (
          <Image className="menu-item-image" src={item.pictureUrl} alt="" width={64} height={64} unoptimized />
        ) : null}
        <span className="menu-item-copy">
          <span className="menu-item-name">{item.name}</span>
          {item.description ? <span className="menu-item-detail">{item.description}</span> : null}
          {item.process ? <span className="menu-item-detail">{item.process}</span> : null}
          {item.roaster ? <span className="menu-item-detail">Roasted by {item.roaster}</span> : null}
        </span>
        <span className="menu-item-prices">
          {item.variants.map((variant) => {
            const label = priceLabel(variant, hasMultiple);
            return (
              <span className="menu-item-price" key={variant.id}>
                {label ? <span>{label}</span> : null}
                {formatPrice(variant.priceCentavos)}
              </span>
            );
          })}
        </span>
        <span className="menu-item-add" aria-hidden="true">Add</span>
      </button>
    </li>
  );
}
