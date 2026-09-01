export type MenuItemType = {
  name: string;
  price: number;
  category: string;
  description: string;
};

export const menuItems: MenuItemType[] = [
    // BLACK.
  {
    name: "Sunburn",
    price: 185,
    category: "BLACK.",
    description:
      "Orange + Espresso",
  },
  {
    name: "Yuzu",
    price: 185,
    category: "BLACK.",
    description:
      "Lemon + Espresso",
  },
  {
    name: "Americano",
    price: 160,
    category: "BLACK.",
    description:
      "Espresso + Water",
  },
// MILK-BASED.
  {
    name: "Banana Ride",
    price: 185,
    category: "MILK-BASED.",
    description:
      "Banana Milk + Espresso",
  },
  {
    name: "Sweet Kanella",
    price:  175,
    category: "MILK-BASED.",
    description:
      "Cinnamon Latte",
  },
  {
    name: "Black Sesame",
    price:  185,
    category: "MILK-BASED.",
    description:
      "",
  },
  {
    name: "Spanish Oat",
    price: 185,
    category: "MILK-BASED.",
    description:
      "",
  },
  // TEA-BASED.
  {
    name: "Gui Hui Latte",
    price: 185,
    category: "TEA-BASED.",
    description:
      "Osmanthus Tea, Milk & Espresso",
  },
  {
    name: "Wave #7",
    price: 195,
    category: "TEA-BASED.",
    description:
      "Earl Grey, Milk & Espresso",
  },
  // CLASSICS.
  {
    name: "Capuccino",
    price: 165,
    category: "CLASSICS.",
    description:
      "",
  },
  {
    name: "Latte",
    price: 175,
    category: "CLASSICS.",
    description:
      "",
  },
  {
    name: "Flat White",
    price: 165,
    category: "CLASSICS.",
    description:
      "",
  },
  //MATCHA.
  {
    name: "Matcha Latte",
    price: 165,
    category: "MATCHA.",
    description:
      "",
  },
  {
    name: "Caramel Matcha",
    price: 165,
    category: "MATCHA.",
    description:
      "",
  },
  {
    name: "Strawberry Matcha",
    price: 165,
    category: "MATCHA.",
    description:
      "",
  },
  {
    name: "Orange Matcha",
    price: 165,
    category: "MATCHA.",
    description:
      "",
  },
  //POUROVER
  {
    name: "Pourover",
    price: 160,
    category: "POUROVER.",
    description:
      "Ask our barista for our available guest beans",
  }

];