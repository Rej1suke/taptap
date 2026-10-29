"use client";

import { useState, type ReactElement } from "react";
import Image from "next/image";
import { addonAllowed } from "@/lib/menu/addons";
import type { MenuItem, MenuVariant } from "@/lib/menu/types";

const priceFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatPrice(priceCentavos: number): string {
  return priceFormatter.format(priceCentavos / 100);
}

function formatVariantName(variant: MenuVariant): string {
  if (variant.temperature === "iced") return "Iced";
  if (variant.temperature === "hot") return "Hot";
  return variant.name.toLowerCase() === "standard" ? "Standard" : variant.name;
}

function variantSize(variant: MenuVariant): string {
  return variant.sizeOz === null ? "Standard" : `${variant.sizeOz} oz`;
}

export default function MenuCustomizer({
  item,
  addons,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  addons: MenuItem[];
  onClose: () => void;
  onAdd: (item: MenuItem, variant: MenuVariant, quantity: number, addons: Array<{ item: MenuItem; variant: MenuVariant }>) => void;
}): ReactElement {
  const [variantId, setVariantId] = useState(item.variants[0]?.id ?? "");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const selectedVariant = item.variants.find((variant) => variant.id === variantId) ?? item.variants[0];
  const temperatures = [...new Map(item.variants.map((variant) => [variant.temperature ?? variant.name, variant])).values()];
  const sizes = [...new Map(item.variants.map((variant) => [variant.sizeOz, variant])).values()];
  const showTemperatures = temperatures.length > 1 && temperatures.every((variant) => variant.temperature !== null);
  const showSizes = sizes.length > 1;
  const showVariantChoices = item.variants.length > 1 && !showTemperatures && !showSizes;
  const addonOptions = item.itemType === "beverage"
    ? addons.filter((addon) => addonAllowed(addon.id, item.id)).flatMap((addon) => addon.variants.map((variant) => ({ item: addon, variant })))
    : [];
  const selectedAddons = addonOptions.filter(({ variant }) => selectedAddonIds.includes(variant.id));
  const unitTotal = (selectedVariant?.priceCentavos ?? 0) + selectedAddons.reduce((sum, addon) => sum + addon.variant.priceCentavos, 0);

  function chooseVariant(predicate: (variant: MenuVariant) => boolean): void {
    const next = item.variants.find((variant) => predicate(variant) &&
      variant.temperature === selectedVariant?.temperature &&
      variant.sizeOz === selectedVariant?.sizeOz) ??
      item.variants.find(predicate);
    if (next) setVariantId(next.id);
  }

  function toggleAddon(variantIdToToggle: string): void {
    setSelectedAddonIds((current) => current.includes(variantIdToToggle)
      ? current.filter((id) => id !== variantIdToToggle)
      : [...current, variantIdToToggle]);
  }

  if (!selectedVariant) {
    return (
      <div className="kiosk-customizer-layer">
        <button type="button" className="kiosk-cart-backdrop" aria-label="Close item options" onClick={onClose} />
        <section className="kiosk-customizer-panel" role="dialog" aria-modal="true" aria-labelledby="kiosk-customizer-title">
          <p>This item has no available options right now.</p>
          <button type="button" onClick={onClose}>Close</button>
        </section>
      </div>
    );
  }

  return (
    <div className="kiosk-customizer-layer">
      <button type="button" className="kiosk-cart-backdrop" aria-label="Close item options" onClick={onClose} />
      <section className="kiosk-customizer-panel" role="dialog" aria-modal="true" aria-labelledby="kiosk-customizer-title">
        {item.pictureUrl ? (
          <div className="kiosk-customizer-photo">
            <Image src={item.pictureUrl} alt="" width={900} height={540} unoptimized />
          </div>
        ) : null}
        <button type="button" className="kiosk-customizer-close" aria-label="Close item options" onClick={onClose}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <div className="kiosk-customizer-content">
          <header className="kiosk-customizer-heading">
            <div>
              <h2 id="kiosk-customizer-title">{item.name}</h2>
              {item.description ? <p>{item.description}</p> : null}
              {item.process ? <p>{item.process}</p> : null}
              {item.roaster ? <p>Roasted by {item.roaster}</p> : null}
            </div>
            <strong>{formatPrice(selectedVariant.priceCentavos)}</strong>
          </header>

          {showTemperatures ? (
            <fieldset className="kiosk-option-group">
              <legend>Temperature</legend>
              <div className="kiosk-option-buttons">
                {temperatures.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={variant.temperature === selectedVariant.temperature ? "is-selected" : ""}
                    aria-pressed={variant.temperature === selectedVariant.temperature}
                    onClick={() => chooseVariant((candidate) => candidate.temperature === variant.temperature)}
                  >
                    {formatVariantName(variant)}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {showSizes ? (
            <fieldset className="kiosk-option-group">
              <legend>Size</legend>
              <div className="kiosk-option-buttons kiosk-size-options">
                {sizes.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={variant.sizeOz === selectedVariant.sizeOz ? "is-selected" : ""}
                    aria-pressed={variant.sizeOz === selectedVariant.sizeOz}
                    onClick={() => chooseVariant((candidate) => candidate.sizeOz === variant.sizeOz)}
                  >
                    {variantSize(variant)}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {showVariantChoices ? (
            <fieldset className="kiosk-option-group">
              <legend>Options</legend>
              <div className="kiosk-option-buttons">
                {item.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={variant.id === selectedVariant.id ? "is-selected" : ""}
                    aria-pressed={variant.id === selectedVariant.id}
                    onClick={() => setVariantId(variant.id)}
                  >
                    {formatVariantName(variant)} · {formatPrice(variant.priceCentavos)}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {addonOptions.length > 0 ? (
            <fieldset className="kiosk-option-group kiosk-addon-group">
              <legend>Add-ons <span>(Optional)</span></legend>
              {addonOptions.map(({ item: addon, variant }) => (
                <label className="kiosk-addon-option" key={variant.id}>
                  <span>
                    <input
                      type="checkbox"
                      checked={selectedAddonIds.includes(variant.id)}
                      onChange={() => toggleAddon(variant.id)}
                    />
                    {addon.name}{variant.sizeOz === null ? "" : ` · ${variant.sizeOz} oz`}
                  </span>
                  <span>+{formatPrice(variant.priceCentavos)}</span>
                </label>
              ))}
            </fieldset>
          ) : null}

          <footer className="kiosk-customizer-footer">
            <div className="kiosk-customizer-quantity" aria-label="Quantity">
              <button type="button" aria-label="Remove one" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button>
              <span aria-live="polite">{quantity}</span>
              <button type="button" aria-label="Add one" disabled={quantity >= 20} onClick={() => setQuantity((current) => Math.min(20, current + 1))}>+</button>
            </div>
            <button
              type="button"
              className="kiosk-customizer-add"
              onClick={() => onAdd(item, selectedVariant, quantity, selectedAddons)}
            >
              Add to cart · {formatPrice(unitTotal * quantity)}
            </button>
          </footer>
        </div>
      </section>
    </div>
  );
}
