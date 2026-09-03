"use client";

import { useEffect, useState } from "react";

const categories = [
  { label: "All", href: "#top", id: "top" },
  { label: "black-based", href: "#black", id: "black" },
  { label: "milk-based.", href: "#milk-based", id: "milk-based" },
  { label: "tea-based.", href: "#tea-based", id: "tea-based" },
  { label: "classics.", href: "#classics", id: "classics" },
  { label: "matcha.", href: "#matcha", id: "matcha" },
  { label: "pourover.", href: "#pourover", id: "pourover" },
];

export default function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState("top");

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
    <nav aria-label="Menu categories" className="sticky top-0 z-20 border-b border-[#d8b79d] bg-[#f5efe6]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-md px-3 py-3 sm:max-w-xl sm:px-4">
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            {categories.map(({ label, href, id }) => {
              const isActive = activeCategory === id;

              return (
                <a
                  key={label}
                  href={href}
                  onClick={() => setActiveCategory(id)}
                  className={
                    isActive
                      ? "whitespace-nowrap rounded-full bg-[#3a1f1d] px-3 py-2 text-xs font-semibold text-[#f5efe6] shadow-sm transition-all duration-300 ease-out will-change-transform hover:scale-[1.02] sm:px-4 sm:text-sm"
                      : "whitespace-nowrap rounded-full bg-[#f3e3d6] px-3 py-2 text-xs font-semibold text-[#3a1f1d] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#ebd8c5] hover:shadow-sm sm:px-4 sm:text-sm"
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