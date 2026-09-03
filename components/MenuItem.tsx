import type { MenuItemType } from "../data/menu";

type MenuItemProps = {
  item: MenuItemType;
};

export default function MenuItem({ item }: MenuItemProps) {
  const hasDualPrice = typeof item.hotPrice === "number" && typeof item.icedPrice === "number";
  const isPourover = item.category === "POUROVER.";

  return (
    <div className="rounded-xl border border-[#c8a98d] bg-[#f9f4ee] p-3 text-[#2f1a18] shadow-[0_8px_22px_rgba(58,31,29,0.08)] sm:p-4">
      <div className="flex items-start gap-3">
        <img
          src="/nuwave.jpg"
          alt={`${item.name} menu item`}
          className="h-16 w-16 shrink-0 rounded-xl border border-[#d9b99d] bg-white object-cover"
        />

        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight text-[#2f1a18] sm:text-lg">
              {item.name}
            </h3>

            {item.description ? (
              <p className="mt-1 text-[11px] leading-relaxed text-[#5b2f2b] sm:text-xs">
                {item.description}
              </p>
            ) : null}
          </div>

          {!isPourover && (
            <div className="shrink-0 text-right text-[11px] font-black tracking-tight text-[#2f1a18] sm:text-sm">
              {hasDualPrice ? (
                <div className="flex flex-col items-end gap-1 leading-tight">
                  <span className="text-[11px] font-black text-[#2f1a18] sm:text-sm">₱{item.hotPrice}</span>
                  <span className="text-[11px] font-black text-[#2f1a18] sm:text-sm">₱{item.icedPrice}</span>
                </div>
              ) : (
                <span>₱{item.price}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}