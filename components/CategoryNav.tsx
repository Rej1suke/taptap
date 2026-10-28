"use client";

import { useEffect, useRef, type ReactElement } from "react";

type CategoryLink = { id: string; name: string; count: number };

// Category chips filter the list; each carries its item count so an empty filter never surprises.
export default function CategoryNav({
  categories,
  totalCount,
  selectedCategoryId,
  onSelectCategory,
}: {
  categories: CategoryLink[];
  totalCount: number;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}): ReactElement {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const activeButton = nav?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!nav || !activeButton) return;
    const bounds = nav.getBoundingClientRect();
    const current = activeButton.getBoundingClientRect();
    if (current.left < bounds.left || current.right > bounds.right) {
      nav.scrollLeft += current.left - bounds.left - (bounds.width - current.width) / 2;
    }
  }, [selectedCategoryId]);

  return (
    <nav id="category-nav" ref={navRef} aria-label="Menu categories" className="menu-chips">
      <ul>
        <li>
          <button type="button" aria-pressed={selectedCategoryId === null} onClick={() => onSelectCategory(null)}>
            All <span className="menu-chip-count">{totalCount}</span>
          </button>
        </li>
        {categories.map(({ id, name, count }) => (
          <li key={id}>
            <button type="button" aria-pressed={selectedCategoryId === id} onClick={() => onSelectCategory(id)}>
              {name} <span className="menu-chip-count">{count}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
