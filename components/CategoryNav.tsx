"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";

type CategoryLink = { id: string; name: string };

export default function CategoryNav({ categories }: { categories: CategoryLink[] }): ReactElement {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const navRef = useRef<HTMLElement>(null);
  const preferredCategory = useRef<string | null>(null);

  useEffect(() => {
    const sections = categories.map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    preferredCategory.current = window.location.hash.slice(1) || preferredCategory.current;
    let frame = 0;
    const update = (): void => {
      frame = 0;
      const offset = (navRef.current?.getBoundingClientRect().height ?? 64) + 28;
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        setActiveCategory(sections.at(-1)?.id ?? "");
        return;
      }
      const positions = sections.map((section) => ({ id: section.id, top: section.getBoundingClientRect().top }));
      const visible = positions.filter(({ top }) => top <= offset);
      const nearestTop = Math.max(...visible.map(({ top }) => top));
      const nearestRow = visible.filter(({ top }) => Math.abs(top - nearestTop) < 2);
      setActiveCategory((current) => {
        const preferred = nearestRow.find(({ id }) => id === preferredCategory.current);
        const retained = nearestRow.find(({ id }) => id === current);
        return preferred?.id ?? retained?.id ?? nearestRow[0]?.id ?? sections[0]?.id ?? "";
      });
    };
    const onScroll = (): void => { if (!frame) frame = window.requestAnimationFrame(update); };
    const initialFrame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [categories]);

  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>("[aria-current='location']");
    if (!nav || !link) return;
    const bounds = nav.getBoundingClientRect();
    const current = link.getBoundingClientRect();
    if (current.left < bounds.left || current.right > bounds.right) {
      nav.scrollLeft += current.left - bounds.left - (bounds.width - current.width) / 2;
    }
  }, [activeCategory]);

  return (
    <nav ref={navRef} aria-label="Menu categories" className="menu-nav">
      <ul>{categories.map(({ id, name }) => <li key={id}>
        <a href={`#${id}`} aria-current={activeCategory === id ? "location" : undefined}
          onClick={(event) => {
            preferredCategory.current = id;
            setActiveCategory(id);
            if (event.detail === 0) document.getElementById(id)?.focus({ preventScroll: true });
          }}>{name}</a>
      </li>)}</ul>
    </nav>
  );
}
