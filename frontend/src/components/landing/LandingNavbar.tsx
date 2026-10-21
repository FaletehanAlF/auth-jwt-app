"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_ITEMS = [
  { id: "beranda", label: "Beranda" },
  { id: "tentang-kami", label: "Tentang Kami" },
  { id: "cara-kerja", label: "Cara Kerja" },
  { id: "testimoni", label: "Testimoni" },
  { id: "hubungi-kami", label: "Hubungi Kami" },
];

function LogoMark() {
  return (
    <Image
      src="/assets/jobtrack.avif"
      alt=""
      width={36}
      height={36}
      aria-hidden="true"
      className="h-9 w-9 shrink-0 object-contain"
    />
  );
}

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("beranda");

  useEffect(() => {
    const updateActive = () => {
      if (window.scrollY < 180) {
        setActive("beranda");
        return;
      }
      for (const item of NAV_ITEMS.slice(1)) {
        const element = document.getElementById(item.id);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActive(item.id);
          return;
        }
      }
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  const scrollToSection = (id: string) => {
    if (id === "beranda") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(id);
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
    setActive(id);
    setOpen(false);
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-white/25 bg-sky-700/40 px-4 shadow-[0_10px_30px_-16px_rgba(2,60,120,0.5)] backdrop-blur-md sm:px-5">
        <button
          type="button"
          onClick={() => scrollToSection("beranda")}
          className="flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="JobTrack - ke beranda"
        >
          <LogoMark />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            JobTrack
          </span>
        </button>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                active === item.id ? "text-white" : "text-sky-100 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-neutral-900 transition-colors duration-150 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 active:bg-neutral-100"
          >
            Masuk
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:hidden"
        >
          {open ? (
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
              <path
                d="M3.5 6h13M3.5 10h13M3.5 14h13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 w-full max-w-5xl rounded-3xl border border-neutral-200/80 bg-white p-4 shadow-lg md:hidden">
          <nav aria-label="Navigasi mobile" className="w-full space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                  active === item.id
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 border-t border-neutral-200/70 pt-4 mt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950"
              >
                Masuk
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}