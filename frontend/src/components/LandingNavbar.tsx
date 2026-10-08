"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" width="18" height="18">
        <rect
          x="3"
          y="7.5"
          width="18"
          height="12.5"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    </span>
  );
}

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Kiri: Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          aria-label="JobTrack - ke beranda"
        >
          <LogoMark />
          <span className="font-display text-lg font-bold tracking-tight text-neutral-900">
            JobTrack
          </span>
        </Link>

        {/* Tengah: Navigasi desktop */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative rounded py-1 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-neutral-900 transition-transform duration-150 group-hover:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        {/* Kanan: Auth desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950"
          >
            Daftar
          </Link>
        </div>

        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 md:hidden"
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

      {/* Mobile: panel menu */}
      {open && (
        <div className="border-t border-neutral-200/70 bg-white md:hidden">
          <nav aria-label="Navigasi mobile" className="mx-auto w-full max-w-6xl space-y-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t border-neutral-200/70 pt-4 mt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-neutral-200 px-5 text-sm font-medium text-neutral-800 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950"
              >
                Daftar
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
