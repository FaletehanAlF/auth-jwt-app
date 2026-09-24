"use client"; // Wajib: pakai state buka/tutup + deteksi klik di luar (browser only)

// Import hooks React
import { useEffect, useRef, useState } from "react";
// Import Link Next.js (navigasi tanpa reload) + pathname aktif otomatis
import Link from "next/link";
import { usePathname } from "next/navigation";

// ============================================================
// Pilihan tujuan — muncul di dalam kapsul saat Menu diklik
// ============================================================
const MENU_ITEMS = [
  { label: "Home", desc: "Kembali ke halaman utama", href: "/home" },
  { label: "About Us", desc: "Kenalan dengan JobTrack", href: "/about" },
  { label: "Profile", desc: "Kelola profil kamu", href: "/profile" },
];

// ============================================================
// Navbar kapsul: cuma logo + tombol Menu.
// Klik Menu -> pilihan Home / About Us / Profile muncul di dalam kapsul.
// ============================================================
export default function Navbar() {
  // Status menu buka / tutup
  const [open, setOpen] = useState(false);
  // Path halaman aktif untuk highlight pilihan (misal "/home")
  const pathname = usePathname();
  // Ref kapsul untuk deteksi klik di luar
  const capsuleRef = useRef<HTMLDivElement>(null);

  // Klik di luar kapsul -> tutup menu
  useEffect(() => {
    if (!open) return; // menu tertutup, tidak perlu dengar klik
    const handleClickOutside = (e: MouseEvent) => {
      if (capsuleRef.current && !capsuleRef.current.contains(e.target as Node)) {
        setOpen(false); // klik di luar, tutup
      }
    };
    document.addEventListener("mousedown", handleClickOutside); // dengar klik
    return () => document.removeEventListener("mousedown", handleClickOutside); // cleanup
  }, [open]);

  // Tombol Escape -> tutup menu (aksesibilitas)
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    // Kapsul fixed: tetap stay di atas saat scroll
    <header className="fixed inset-x-0 top-3 z-50 px-4 sm:top-5 sm:px-6">
      <div
        ref={capsuleRef} // ref untuk klik-di-luar
        className="mx-auto w-full max-w-5xl rounded-3xl border border-white/15 bg-neutral-950/60 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        {/* Baris utama: logo + tombol Menu */}
        <div className="flex h-16 w-full items-center gap-3 px-4 sm:px-5">
          {/* Logo + ikon JobTrack di dalam navbar */}
          <Link href="/home" className="flex min-w-0 items-center gap-2.5" aria-label="JobTrack home">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-400/15 ring-1 ring-white/15">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" stroke="#5eead4" strokeWidth="1.8" />
                <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" stroke="#5eead4" strokeWidth="1.8" />
                <path d="M3 12.5h18" stroke="#5eead4" strokeWidth="1.8" />
              </svg>
            </span>
            <span className="font-display text-base font-semibold tracking-tight text-white">
              JobTrack
            </span>
          </Link>

          {/* Tombol Menu / Close di kanan */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)} // toggle buka/tutup
            aria-label={open ? "Close menu" : "Open menu"} // aksesibilitas
            aria-expanded={open} // status untuk screen reader
            aria-controls="capsule-menu" // panel yang dikontrol
            className="ml-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {/* Teks berganti Menu <-> Close */}
            <span>{open ? "Close" : "Menu"}</span>
            {/* Ikon + berputar jadi X saat dibuka */}
            <span
              aria-hidden="true"
              className={`inline-flex h-3.5 w-3.5 items-center justify-center transition-transform duration-300 ${
                open ? "rotate-45" : "rotate-0"
              }`}
            >
              <svg viewBox="0 0 14 14" fill="none" className="h-3.5 w-3.5">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        </div>

        {/* Panel pilihan di dalam kapsul: expand halus + item stagger */}
        <div
          id="capsule-menu"
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav aria-label="Menu" className="border-t border-white/10 px-4 py-3 sm:px-5">
            <ul className="flex flex-col gap-1">
              {MENU_ITEMS.map((item, i) => {
                const active = pathname === item.href; // halaman aktif?
                return (
                  <li
                    key={item.href}
                    // Efek stagger: tiap item muncul berurutan dengan delay
                    style={{ transitionDelay: open ? `${i * 60}ms` : "0ms" }}
                    className={`transition-all duration-300 ${
                      open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                    }`}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)} // klik pilihan langsung tutup menu
                      className={`flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        active
                          ? "bg-white/15 text-white" // pilihan aktif disorot
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {/* Nomor ala StaggeredMenu: 01 02 03 */}
                      <span className="text-xs font-medium tabular-nums text-teal-300">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base font-semibold tracking-tight">
                          {item.label}
                        </span>
                        <span className="block truncate text-xs text-white/50">
                          {item.desc}
                        </span>
                      </span>
                      {/* Panah kanan */}
                      <span aria-hidden="true" className="ml-auto shrink-0 text-white/40">
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
