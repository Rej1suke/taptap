export type MenuItemType = {
  name: string;
  price?: number;
  hotPrice?: number;
  icedPrice?: number;
  category: string;
  description: string;
};

export const menuItems: MenuItemType[] = [
    // BLACK-BASED.
  {
    name: "Sunburn",
    price: 185,
    category: "BLACK-BASED.",
    description:
      "Orange + Espresso",
  },
  {
    name: "Yuzu",
    price: 185,
    category: "BLACK-BASED.",
    description:
      "Lemon + Espresso",
  },
  {
    name: "Americano",
    hotPrice: 160,
    icedPrice: 155,
    category: "BLACK-BASED.",
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
    hotPrice: 175,
    icedPrice: 170,
    category: "MILK-BASED.",
    description:
      "Cinnamon Latte",
  },
  {
    name: "Black Sesame",
    hotPrice: 185,
    icedPrice: 180,
    category: "MILK-BASED.",
    description:
      "",
  },
  {
    name: "Spanish Oat",
    hotPrice: 185,
    icedPrice: 180,
    category: "MILK-BASED.",
    description:
      "",
  },
  // TEA-BASED.
  {
    name: "Gui Hui Latte",
    hotPrice: 185,
    icedPrice: 175,
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
    hotPrice: 175,
    icedPrice: 160,
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
    hotPrice: 175,
    icedPrice: 165,
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