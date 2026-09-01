"use client";

import { useEffect, useState } from "react";

const categories = [
  { label: "All", href: "#top", id: "top" },
  { label: "black.", href: "#black", id: "black" },
  { label: "milk-based.", href: "#milk-based", id: "milk-based" },
  { label: "tea-based.", href: "#tea-based", id: "tea-based" },
  { label: "classics.", href: "#classics", id: "classics" },
  { label: "matcha.", href: "#matcha", id: "matcha" },
  { label: "pourover.", href: "#pourover", id: "pourover" },
];

export default function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState("top");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const sections = categories
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) return;

    const updateActiveCategory = () => {
      const triggerY = window.innerHeight * 0.4;
      const activeSection = [...sections].reverse().find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= triggerY;
      });

      setActiveCategory(activeSection?.id ?? sections[0].id);
    };

    updateActiveCategory();
    window.addEventListener("scroll", updateActiveCategory, { passive: true });
    window.addEventListener("resize", updateActiveCategory);

    return () => {
      window.removeEventListener("scroll", updateActiveCategory);
      window.removeEventListener("resize", updateActiveCategory);
    };
  }, []);

  return (
    <nav aria-label="Menu categories" className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-xl px-4 py-3">
        <div className="flex items-center justify-between gap-2 md:hidden">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Categories
          </p>
          <button
            type="button"
            onClick={() => setIsMobileOpen((open) => !open)}
            className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
            aria-expanded={isMobileOpen}
            aria-controls="category-nav-list"
          >
            {isMobileOpen ? "Close" : "Menu"}
          </button>
        </div>

        <div
          id="category-nav-list"
          className={isMobileOpen ? "block" : "hidden md:block"}
        >
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:mt-0 md:overflow-visible">
            {categories.map(({ label, href, id }) => {
              const isActive = activeCategory === id;

              return (
                <a
                  key={label}
                  href={href}
                  onClick={() => {
                    setActiveCategory(id);
                    setIsMobileOpen(false);
                  }}
                  className={
                    isActive
                      ? "whitespace-nowrap rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out will-change-transform hover:scale-[1.02]"
                      : "whitespace-nowrap rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-black transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-slate-200 hover:shadow-sm"
                  }
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}