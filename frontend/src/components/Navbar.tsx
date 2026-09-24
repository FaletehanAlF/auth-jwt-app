"use client"; // Wajib: pakai state buka/tutup + deteksi klik di luar (browser only)

// Import hooks React
import { useEffect, useRef, useState } from "react";
// Import Link Next.js (navigasi tanpa reload) + pathname aktif otomatis
import Link from "next/link";
import { usePathname } from "next/navigation";

// ============================================================
// Daftar menu tetap: Home, About Us, Profile (tanpa Applications)
// ============================================================
const MENU_ITEMS = [
  { label: "Home", href: "/home" },
  { label: "About Us", href: "/about" },
  { label: "Profile", href: "/profile" },
];

// ============================================================
// Navbar hybrid: kapsul di desktop, hamburger di HP
// Logo JobTrack selalu di dalam navbar (kiri)
// ============================================================
export default function Navbar() {
  // Status menu HP buka / tutup
  const [open, setOpen] = useState(false);
  // Path halaman aktif untuk highlight link (misal "/home")
  const pathname = usePathname();
  // Ref kapsul untuk deteksi klik di luar
  const capsuleRef = useRef<HTMLDivElement>(null);

  // Klik di luar kapsul -> tutup menu HP
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

  // Tombol Escape -> tutup menu HP (aksesibilitas)
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open ]);

  // Style link desktop: aktif = pill putih, pasif = teks redup + hover
  const desktopLinkClass = (href: string) =>
    pathname === href
      ? "rounded-full bg-white px-3.5 py-2 text-sm font-medium text-neutral-950"
      : "rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white";

  // Style link HP: aktif = bg putih transparan, full-width rata kiri
  const mobileLinkClass = (href: string) =>
    pathname === href
      ? "block rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium text-white"
      : "block rounded-xl px-4 py-2.5 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white";

  return (
    // Kapsul fixed: tetap stay di atas saat scroll
    <header className="fixed inset-x-0 top-3 z-50 px-4 sm:top-5 sm:px-6">
      <div
        ref={capsuleRef} // ref untuk klik-di-luar
        className="mx-auto w-full max-w-5xl rounded-3xl border border-white/15 bg-neutral-950/60 shadow-2xl shadow-black/40 backdrop-blur-xl sm:rounded-full"
      >
        {/* Baris utama: logo + link desktop + tombol hamburger */}
        <div className="flex h-16 w-full items-center gap-3 px-4 sm:px-5">
          {/* Logo JobTrack di dalam navbar */}
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

          {/* Link inline — hanya desktop */}
          <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 sm:flex">
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={desktopLinkClass(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Avatar di kanan — hanya desktop */}
          <div className="ml-auto hidden shrink-0 items-center sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white ring-1 ring-white/20">
              JT
            </span>
          </div>

          {/* Tombol hamburger — hanya HP */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)} // toggle buka/tutup
            aria-label={open ? "Close menu" : "Open menu"} // aksesibilitas
            aria-expanded={open} // status untuk screen reader
            className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:hidden"
          >
            {open ? (
              // Ikon X (tutup)
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-5 w-5">
                <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              // Ikon hamburger (buka)
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-5 w-5">
                <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Panel dropdown HP: expand halus via max-height + opacity */}
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out sm:hidden ${
            open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav aria-label="Mobile" className="border-t border-white/10 px-4 py-3">
            <ul className="flex flex-col gap-1">
              {MENU_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    onClick={() => setOpen(false)} // klik link langsung tutup menu
                    className={mobileLinkClass(item.href)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
