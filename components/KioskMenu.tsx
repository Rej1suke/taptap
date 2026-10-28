"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CategoryNav from "@/components/CategoryNav";
import MenuCustomizer from "@/components/MenuCustomizer";
import MenuItem from "@/components/MenuItem";
import type { ItemType, MenuItem as MenuItemData, MenuResponse, MenuVariant } from "@/lib/menu/types";
import { readDeviceOrders, rememberOrder, type DeviceOrder } from "@/lib/orders/device";
import { formatPrice, isPublicOrder, type OrderType } from "@/lib/orders/types";

type CartAddon = {
  itemName: string;
  variant: MenuVariant;
};

type CartLine = {
  key: string;
  itemName: string;
  itemType: ItemType;
  variant: MenuVariant;
  addons: CartAddon[];
  quantity: number;
};

type DrawerMode = "cart" | "orders";

function errorMessage(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("error" in value)) return null;
  const error = value.error;
  return typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
    ? error.message
    : null;
}

function variantLabel(variant: MenuVariant, itemType: ItemType): string {
  if (itemType === "addon") return variant.sizeOz === null ? "Add-on" : `${variant.sizeOz} oz add-on`;
  const temperature = variant.temperature === "iced" ? "Iced" : variant.temperature === "hot" ? "Hot" : null;
  const name = variant.name.toLowerCase() === "standard" ? null : variant.name;
  const size = variant.sizeOz === null ? null : `${variant.sizeOz} oz`;
  return [temperature ?? name, size].filter(Boolean).join(" · ") || "Standard";
}

function unitPrice(line: CartLine): number {
  return line.variant.priceCentavos + line.addons.reduce((sum, addon) => sum + addon.variant.priceCentavos, 0);
}

// The same drink with a different set of add-ons is a separate cart line.
function lineKey(variantId: string, addons: CartAddon[]): string {
  return [variantId, ...addons.map((addon) => addon.variant.id).sort()].join("+");
}

function withTable(path: string, tableNumber: number | null): string {
  if (tableNumber === null) return path;
  return `${path}${path.includes("?") ? "&" : "?"}table=${tableNumber}`;
}

function CartLines({
  cart,
  onChangeQuantity,
}: {
  cart: CartLine[];
  onChangeQuantity: (key: string, amount: number) => void;
}): ReactElement {
  return (
    <ul className="kiosk-cart-lines">
      {cart.map((line) => (
        <li className="kiosk-cart-line" key={line.key}>
          <div>
            <strong>{line.itemName}</strong>
            <span>{variantLabel(line.variant, line.itemType)}</span>
            {line.addons.length > 0 ? (
              <span className="kiosk-line-addons">
                {line.addons.map((addon) => `${addon.itemName} +${formatPrice(addon.variant.priceCentavos)}`).join(" · ")}
              </span>
            ) : null}
            <span className="kiosk-line-total">{formatPrice(unitPrice(line) * line.quantity)}</span>
          </div>
          <div className="kiosk-quantity" aria-label={`Quantity for ${line.itemName}`}>
            <button type="button" aria-label={line.quantity === 1 ? `Remove ${line.itemName}` : `Remove one ${line.itemName}`} onClick={() => onChangeQuantity(line.key, -1)}>−</button>
            <span aria-live="polite">{line.quantity}</span>
            <button type="button" aria-label={`Add one ${line.itemName}`} onClick={() => onChangeQuantity(line.key, 1)}>+</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

const orderDateFormatter = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function DeviceOrderList({ orders, tableNumber }: { orders: DeviceOrder[]; tableNumber: number | null }): ReactElement {
  if (orders.length === 0) {
    return <p className="kiosk-empty-cart">Orders you place on this phone will appear here.</p>;
  }
  return (
    <ul className="kiosk-device-orders">
      {orders.map((order) => (
        <li key={order.token}>
          <Link href={withTable(`/order/${order.token}`, tableNumber)}>
            <span className="kiosk-device-order-head">
              <strong>Order #{order.orderNumber}</strong>
              <span>{formatPrice(order.totalCentavos)}</span>
            </span>
            <span className="kiosk-device-order-summary">{order.summary}</span>
            <span className="kiosk-device-order-meta">{orderDateFormatter.format(new Date(order.createdAt))} · View status ›</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function KioskMenu({ menu, tableNumber }: { menu: MenuResponse; tableNumber: number | null }): ReactElement {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [customizingItem, setCustomizingItem] = useState<MenuItemData | null>(null);
  const [orderType, setOrderType] = useState<OrderType>("dine_in");
  const [deviceOrders, setDeviceOrders] = useState<DeviceOrder[]>([]);
  const previousSelectedCategoryId = useRef(selectedCategoryId);
  const requestId = useRef<string | null>(null);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + unitPrice(line) * line.quantity, 0);
  const visibleCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    // Add-ons are picked inside a drink's options, not ordered on their own.
    const orderable = menu.categories.filter((category) => !category.items.every((item) => item.itemType === "addon"));
    if (!query) return orderable;
    return orderable.map((category) => ({
      ...category,
      items: category.items.filter((item) => [
        item.name,
        item.description,
        item.process,
        item.roaster,
      ].some((value) => value?.toLocaleLowerCase().includes(query))),
    })).filter((category) => category.items.length > 0);
  }, [menu.categories, search]);
  const shownCategories = selectedCategoryId === null
    ? visibleCategories
    : visibleCategories.filter((category) => category.id === selectedCategoryId);
  const visibleItemCount = visibleCategories.reduce((sum, category) => sum + category.items.length, 0);
  const addonItems = menu.categories
    .flatMap((category) => category.items)
    .filter((item) => item.itemType === "addon");

  // A filter change brings the top of the list back under the sticky toolbar.
  useEffect(() => {
    if (previousSelectedCategoryId.current === selectedCategoryId) return;
    previousSelectedCategoryId.current = selectedCategoryId;
    const list = document.getElementById("menu-list");
    if (list && list.getBoundingClientRect().top < 0) {
      window.requestAnimationFrame(() => list.scrollIntoView({ block: "start" }));
    }
  }, [selectedCategoryId]);

  function openDrawer(mode: DrawerMode): void {
    if (mode === "orders") setDeviceOrders(readDeviceOrders());
    setDrawerMode(mode);
    setNotice("");
    setCartOpen(true);
  }

  function addCustomizedItem(
    item: MenuItemData,
    variant: MenuVariant,
    quantity: number,
    addons: Array<{ item: MenuItemData; variant: MenuVariant }>,
  ): void {
    const cartAddons = addons.map((addon) => ({ itemName: addon.item.name, variant: addon.variant }));
    const key = lineKey(variant.id, cartAddons);
    const existing = cart.find((line) => line.key === key);
    if (count + quantity > 100 || (existing?.quantity ?? 0) + quantity > 20) {
      setNotice("This order has reached its item limit.");
      return;
    }
    requestId.current = null;
    setNotice(`${quantity} ${item.name}${quantity === 1 ? "" : "s"} added to your order.`);
    setCart((current) => existing
      ? current.map((line) => line.key === key ? { ...line, quantity: line.quantity + quantity } : line)
      : [...current, { key, itemName: item.name, itemType: item.itemType, variant, addons: cartAddons, quantity }]);
    setCustomizingItem(null);
  }

  function changeQuantity(key: string, amount: number): void {
    const line = cart.find((current) => current.key === key);
    if (amount > 0 && line && (line.quantity >= 20 || count >= 100)) {
      setNotice("This order has reached its item limit.");
      return;
    }
    requestId.current = null;
    setCart((current) => current
      .map((candidate) => candidate.key === key ? { ...candidate, quantity: candidate.quantity + amount } : candidate)
      .filter((candidate) => candidate.quantity > 0));
  }

  async function placeOrder(): Promise<void> {
    if (submitting || cart.length === 0) return;
    setSubmitting(true);
    setNotice("");
    // Reusing the token on retry lets the server return the same order instead of a duplicate.
    requestId.current ??= crypto.randomUUID();
    const token = requestId.current;
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: token,
          orderType,
          tableNumber: orderType === "dine_in" ? tableNumber : null,
          paymentMethod: "counter",
          items: cart.map((line) => ({
            variantId: line.variant.id,
            quantity: line.quantity,
            addonVariantIds: line.addons.map((addon) => addon.variant.id),
          })),
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        setNotice(errorMessage(result) ?? "We couldn’t place your order. Please try again.");
        return;
      }
      const order = typeof result === "object" && result !== null && "order" in result ? result.order : null;
      if (!isPublicOrder(order)) {
        setNotice("The order response was not recognized. Please check with the cafe before trying again.");
        return;
      }
      rememberOrder(token, order);
      setCart([]);
      requestId.current = null;
      router.push(withTable(`/order/${token}?placed=1`, tableNumber));
    } catch {
      setNotice("We couldn’t reach the cafe to place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="menu-toolbar">
        <label className="menu-search">
          <span className="menu-sr-only">Search the menu</span>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSelectedCategoryId(null);
            }}
            placeholder="Search drinks and treats"
          />
        </label>
        <CategoryNav
          categories={visibleCategories.map(({ id, name, items }) => ({ id, name, count: items.length }))}
          totalCount={visibleItemCount}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </div>
      <div id="menu-list" className="menu-list">
        {shownCategories.length === 0 ? (
          <section className="menu-empty" role="status">
            <h2>No drinks match “{search.trim()}”</h2>
            <p>Try another drink, ingredient, or roast.</p>
            <button type="button" className="menu-text-action" onClick={() => setSearch("")}>Clear search</button>
          </section>
        ) : shownCategories.map((category) => {
          const isSpecialty = category.items.some((item) => item.roaster !== null || item.process !== null);
          return (
            <section
              key={category.id}
              id={category.id}
              className={`menu-section${isSpecialty ? " menu-section-specialty" : ""}`}
              aria-labelledby={`${category.id}-title`}
            >
              <div className="menu-section-heading">
                <h2 id={`${category.id}-title`}>{category.name}</h2>
                {isSpecialty
                  ? <p>Single origins, their processes and the people who roast them.</p>
                  : <p>{category.items.length} {category.items.length === 1 ? "item" : "items"}</p>}
              </div>
              <ul className="menu-items">
                {category.items.map((item) => (
                  <MenuItem key={item.id} item={item} onCustomize={setCustomizingItem} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="kiosk-live-notice" role="status" aria-live="polite">{notice}</p>
      {count > 0 && !cartOpen ? (
        <button type="button" className="kiosk-cart-bar" onClick={() => openDrawer("cart")}>
          <span>View cart · {count} {count === 1 ? "item" : "items"}</span>
          <strong>{formatPrice(total)}</strong>
        </button>
      ) : null}

      <nav className="kiosk-bottom-nav" aria-label="Main navigation">
        <Link href={withTable("/", tableNumber)}>Home</Link>
        <button type="button" aria-current={cartOpen ? undefined : "page"} onClick={() => {
          setCartOpen(false);
          setSelectedCategoryId(null);
          window.scrollTo({ top: 0 });
        }}>Menu</button>
        <button
          type="button"
          className={drawerMode === "cart" && cartOpen ? "is-current" : ""}
          aria-label={`Cart${count ? `, ${count} items` : ""}`}
          aria-expanded={cartOpen && drawerMode === "cart"}
          aria-controls="kiosk-cart-dialog"
          onClick={() => openDrawer("cart")}
        >
          Cart{count ? <span className="kiosk-nav-badge" aria-hidden="true">{count}</span> : null}
        </button>
        <button
          type="button"
          className={drawerMode === "orders" && cartOpen ? "is-current" : ""}
          onClick={() => openDrawer("orders")}
        >
          Orders
        </button>
      </nav>

      {cartOpen ? (
        <div className="kiosk-cart-layer">
          <button className="kiosk-cart-backdrop" aria-label="Close" onClick={() => setCartOpen(false)} />
          <aside id="kiosk-cart-dialog" className="kiosk-cart-panel" aria-labelledby="kiosk-cart-heading" aria-modal="true" role="dialog">
            <div className="kiosk-cart-header">
              <div>
                <h2 id="kiosk-cart-heading">{drawerMode === "orders" ? "My orders" : "Your cart"}</h2>
                <p className="kiosk-panel-meta">
                  {drawerMode === "orders"
                    ? "Orders placed on this phone"
                    : `${count} ${count === 1 ? "item" : "items"}${tableNumber !== null ? ` · Table ${tableNumber}` : ""}`}
                </p>
              </div>
              <button type="button" className="kiosk-close-cart" onClick={() => setCartOpen(false)}>Close</button>
            </div>

            {drawerMode === "orders" ? (
              <DeviceOrderList orders={deviceOrders} tableNumber={tableNumber} />
            ) : cart.length === 0 ? (
              <p className="kiosk-empty-cart">Your cart is empty. Add something from the menu to get started.</p>
            ) : (
              <>
                <CartLines cart={cart} onChangeQuantity={changeQuantity} />

                <fieldset className="kiosk-checkout-group">
                  <legend>Order type</legend>
                  <div className="kiosk-option-buttons">
                    <button type="button" className={orderType === "dine_in" ? "is-selected" : ""} aria-pressed={orderType === "dine_in"} onClick={() => setOrderType("dine_in")}>
                      Dine-in{tableNumber !== null ? ` · Table ${tableNumber}` : ""}
                    </button>
                    <button type="button" className={orderType === "takeout" ? "is-selected" : ""} aria-pressed={orderType === "takeout"} onClick={() => setOrderType("takeout")}>
                      Takeout
                    </button>
                  </div>
                  {orderType === "dine_in" && tableNumber === null ? (
                    <p className="kiosk-checkout-hint">No table detected. Tap the tag on your table, or tell the cashier where you’re seated.</p>
                  ) : null}
                </fieldset>

                <fieldset className="kiosk-checkout-group">
                  <legend>Payment</legend>
                  <label className="kiosk-pay-option is-selected">
                    <input type="radio" name="payment" checked readOnly />
                    <span>
                      <strong>Pay at the counter</strong>
                      <span>Cash or card when you pick up. We start preparing once you’ve paid.</span>
                    </span>
                  </label>
                  <label className="kiosk-pay-option is-disabled">
                    <input type="radio" name="payment" disabled />
                    <span>
                      <strong>Pay online</strong>
                      <span>GCash, Maya, QR Ph and cards. Coming soon.</span>
                    </span>
                  </label>
                </fieldset>

                <div className="kiosk-cart-total">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
                {notice ? <p className="kiosk-checkout-error" role="alert">{notice}</p> : null}
                <button className="kiosk-place-order" disabled={submitting} onClick={placeOrder}>
                  {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
                </button>
              </>
            )}
          </aside>
        </div>
      ) : null}
      {customizingItem ? (
        <MenuCustomizer
          key={customizingItem.id}
          item={customizingItem}
          addons={addonItems}
          onClose={() => setCustomizingItem(null)}
          onAdd={addCustomizedItem}
        />
      ) : null}
    </>
  );
}
