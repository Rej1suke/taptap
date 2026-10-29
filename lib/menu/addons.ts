// Oat milk can only be swapped into these drinks; the other milk drinks are already made with oat milk.
const OAT_MILK_DRINKS = new Set(["item-sweet-kanella", "item-matcha-latte", "item-caramel-matcha"]);

export function addonAllowed(addonItemId: string, drinkItemId: string): boolean {
  return addonItemId !== "item-oatmilk" || OAT_MILK_DRINKS.has(drinkItemId);
}
