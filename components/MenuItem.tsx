import type { MenuItemType } from "../data/menu";

type MenuItemProps = {
  item: MenuItemType;
};

export default function MenuItem({ item }: MenuItemProps) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-bold text-black">
            {item.name}
          </h3>

          <p className="mt-2 text-sm text-black">
            {item.description}
          </p>
        </div>

        <p className="shrink-0 whitespace-nowrap font-black text-black">
          ₱{item.price}
        </p>
      </div>
    </div>
  );
}