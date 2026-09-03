import { menuItems, type MenuItemType } from "@/data/menu";
import MenuItem from "@/components/MenuItem";

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-[#f5efe6] text-[#2f1a18]">

      {/* Restaurant Header */}
      <header className="bg-[#f1e2d2] px-4 py-8 text-center text-[#2f1a18] sm:px-6 sm:py-10">
        <div className="mx-auto max-w-md sm:max-w-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm transition-transform duration-300 hover:scale-105 sm:h-20 sm:w-20">
            <img
              src="/nuwave.jpg"
              alt="Ñuwave Coffee logo"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>

          <h1 className="mt-4 text-2xl font-black text-[#2f1a18] sm:text-3xl">
            Ñuwave Specialty Coffee
          </h1>

          <p className="mt-2 text-sm italic text-[#5b2f2b] sm:text-base">
            Don&apos;t just drink coffee, experience it.
          </p>

          <p className="mt-3 text-[10px] text-[#5b2f2b] sm:text-xs">
            📍 Corner Fajardo & Libertad Street, Iloilo City
          </p>

        </div>
      </header>

      {/* Menu */}
      <div className="bg-[#f5efe6] px-3 py-6 sm:px-4 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-5 border-b border-[#c8a98d] pb-3 text-center text-[#2f1a18]">
            <p className="text-3xl font-black tracking-tight sm:text-4xl">
              COFFEE MENU
            </p>
          </header>

          <section id="black" className="scroll-mt-24 mb-6 rounded-2xl border border-[#d8c2b1] bg-[#f1e6d8] p-3 sm:p-5">
            <h2 className="mb-4 text-xl font-black text-[#2f1a18] sm:text-2xl">
              BLACK-BASED.
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {menuItems
                .filter((item: MenuItemType) => item.category === "BLACK-BASED.")
                .map((item: MenuItemType) => (
                  <MenuItem key={item.name} item={item} />
                ))}
            </div>
          </section>

          <section id="milk-based" className="scroll-mt-24 mb-6 rounded-2xl border border-[#d8c2b1] bg-[#f1e6d8] p-3 sm:p-5">
            <h2 className="mb-4 text-xl font-black text-[#2f1a18] sm:text-2xl">
              MILK-BASED.
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {menuItems
                .filter((item: MenuItemType) => item.category === "MILK-BASED.")
                .map((item: MenuItemType) => (
                  <MenuItem key={item.name} item={item} />
                ))}
            </div>
          </section>

          <section id="tea-based" className="scroll-mt-24 mb-6 rounded-2xl border border-[#d8c2b1] bg-[#f1e6d8] p-3 sm:p-5">
            <h2 className="mb-4 text-xl font-black text-[#2f1a18] sm:text-2xl">
              TEA-BASED.
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {menuItems
                .filter((item: MenuItemType) => item.category === "TEA-BASED.")
                .map((item: MenuItemType) => (
                  <MenuItem key={item.name} item={item} />
                ))}
            </div>
          </section>

          <section id="classics" className="scroll-mt-24 mb-6 rounded-2xl border border-[#d8c2b1] bg-[#f1e6d8] p-3 sm:p-5">
            <h2 className="mb-4 text-xl font-black text-[#2f1a18] sm:text-2xl">
              CLASSICS.
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {menuItems
                .filter((item: MenuItemType) => item.category === "CLASSICS.")
                .map((item: MenuItemType) => (
                  <MenuItem key={item.name} item={item} />
                ))}
            </div>
          </section>

          <section id="matcha" className="scroll-mt-24 mb-6 rounded-2xl border border-[#d8c2b1] bg-[#f1e6d8] p-3 sm:p-5">
            <h2 className="mb-4 text-xl font-black text-[#2f1a18] sm:text-2xl">
              MATCHA.
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {menuItems
                .filter((item: MenuItemType) => item.category === "MATCHA.")
                .map((item: MenuItemType) => (
                  <MenuItem key={item.name} item={item} />
                ))}
            </div>
          </section>

          <section id="pourover" className="scroll-mt-24 rounded-2xl border border-[#d8c2b1] bg-[#f1e6d8] p-3 sm:p-5">
            <h2 className="mb-4 text-xl font-black text-[#2f1a18] sm:text-2xl">
              POUROVER.
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {menuItems
                .filter((item: MenuItemType) => item.category === "POUROVER.")
                .map((item: MenuItemType) => (
                  <MenuItem key={item.name} item={item} />
                ))}
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-8 border-t border-[#d9b99d] bg-[#f1e2d2] text-[#2f1a18]">
        <div className="mx-auto grid max-w-md gap-6 px-3 py-8 sm:max-w-2xl sm:px-4 md:grid-cols-[1.2fr_0.9fr] md:gap-8">
          <div className="space-y-3">
            <p className="text-lg font-black tracking-wide">Ñuwave Specialty Coffee</p>
            <p className="text-sm leading-relaxed text-[#5b2f2b]">
              Don't just drink coffee, experience it.
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-sm">
              <a
                href="https://www.instagram.com/nuwavecoffeeph/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#7a3d35] px-3 py-1.5 text-[#3b201d] transition-colors hover:border-[#3b201d] hover:bg-white/40"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/p/%C3%91uwave-Coffee-61556594862390/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#7a3d35] px-3 py-1.5 text-[#3b201d] transition-colors hover:border-[#3b201d] hover:bg-white/40"
              >
                Facebook
              </a>
            </div>
          </div>

          <div className="space-y-2 overflow-hidden text-sm text-[#5b2f2b]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5b2f2b]">
              Contact
            </p>
            <p className="break-words">📍 Corner Fajardo & Libertad Street, Iloilo City</p>
            <p className="break-words">📞 +63 907 831 3114</p>
            <p className="break-all">✉️ newwavespecialitycoffee@gmail.com</p>
            <p className="break-words">☕ Open daily • 11:00 AM – 1:00 AM</p>
          </div>
        </div>
      </footer>

    </main>
  );
}