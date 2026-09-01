import { menuItems, type MenuItemType } from "@/data/menu";
import MenuItem from "@/components/MenuItem";
import CategoryNav from "@/components/CategoryNav";

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-stone-50">

      {/* Restaurant Header */}
      <header className="bg-slate-950 px-6 py-10 text-center text-white">
        <div className="mx-auto max-w-xl">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-black text-slate-950">
            ÑU
          </div>

          <h1 className="mt-4 text-3xl font-black">
            Ñuwave Coffee
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Serving Speciality Coffee
          </p>

          <p className="mt-3 text-xs text-slate-400">
            📍 Iloilo City, Philippines
          </p>

        </div>
      </header>

      {/* Category Navigation */}
      <CategoryNav />

      {/* Menu */}
      <section id="black" className="scroll-mt-24 mx-auto max-w-xl px-4 py-8">

        <h2 className="text-2xl font-black text-black">
          BLACK.
        </h2>

        <div className="mt-5 space-y-4">
          {menuItems
            .filter((item: MenuItemType) => item.category === "BLACK.")
            .map((item: MenuItemType) => (
              <MenuItem
                key={item.name}
                item={item}
              />
            ))}
        </div>

      </section>

      <section id="milk-based" className="scroll-mt-24 mx-auto max-w-xl px-4 py-8">
  <h2 className="text-2xl font-black text-black">
    MILK-BASED.
  </h2>

  <div className="mt-5 space-y-4">
    {menuItems
      .filter((item: MenuItemType) => item.category === "MILK-BASED.")
      .map((item: MenuItemType) => (
        <MenuItem
          key={item.name}
          item={item}
        />
      ))}
  </div>
</section>

<section id="tea-based" className="scroll-mt-24 mx-auto max-w-xl px-4 py-8">
  <h2 className="text-2xl font-black text-black">
    TEA-BASED.
  </h2>

  <div className="mt-5 space-y-4">
    {menuItems
      .filter((item: MenuItemType) => item.category === "TEA-BASED.")
      .map((item: MenuItemType) => (
        <MenuItem
          key={item.name}
          item={item}
        />
      ))}
  </div>
</section>

<section id="classics" className="scroll-mt-24 mx-auto max-w-xl px-4 py-8">
  <h2 className="text-2xl font-black text-black">
    CLASSICS.
  </h2>

  <div className="mt-5 space-y-4">
    {menuItems
      .filter((item: MenuItemType) => item.category === "CLASSICS.")
      .map((item: MenuItemType) => (
        <MenuItem
          key={item.name}
          item={item}
        />
      ))}
  </div>
</section>

<section id="matcha" className="scroll-mt-24 mx-auto max-w-xl px-4 py-8">
  <h2 className="text-2xl font-black text-black">
    MATCHA.
  </h2>

  <div className="mt-5 space-y-4">
    {menuItems
      .filter((item: MenuItemType) => item.category === "MATCHA.")
      .map((item: MenuItemType) => (
        <MenuItem
          key={item.name}
          item={item}
        />
      ))}
  </div>
</section>

<section id="pourover" className="scroll-mt-24 mx-auto max-w-xl px-4 py-8">
  <h2 className="text-2xl font-black text-black">
    POUROVER.
  </h2>

  <div className="mt-5 space-y-4">
    {menuItems
      .filter((item: MenuItemType) => item.category === "POUROVER.")
      .map((item: MenuItemType) => (
        <MenuItem
          key={item.name}
          item={item}
        />
      ))}
  </div>
</section>

      <footer className="mt-8 border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-2xl gap-6 px-4 py-8 md:grid-cols-[1.2fr_0.9fr] md:gap-8">
          <div className="space-y-3">
            <p className="text-lg font-black tracking-wide">Ñuwave Coffee</p>
            <p className="text-sm leading-relaxed text-slate-300">
              Small coffee shop that serves speciality coffee daily.
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-sm">
              <a
                href="https://www.instagram.com/nuwavecoffeeph/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/p/%C3%91uwave-Coffee-61556594862390/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-700 px-3 py-1.5 text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
              >
                Facebook
              </a>
            </div>
          </div>

          <div className="space-y-2 overflow-hidden text-sm text-slate-300">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Contact
            </p>
            <p className="break-words">📍 Fajardo St, Jaro, Iloilo City</p>
            <p className="break-words">📞 +63 907 831 3114</p>
            <p className="break-all">✉️ newwavespecialitycoffee@gmail.com</p>
            <p className="break-words">☕ Open daily • 11:00 AM – 1:00 AM</p>
          </div>
        </div>
      </footer>

    </main>
  );
}