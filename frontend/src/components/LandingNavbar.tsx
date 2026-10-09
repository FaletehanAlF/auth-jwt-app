"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/#contact" },
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

  return (
    <header className="absolute inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 rounded-full border border-white/25 bg-sky-700/40 px-3 shadow-[0_10px_30px_-16px_rgba(2,60,120,0.5)] backdrop-blur-md">
        {/* Kiri: Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="JobTrack - ke beranda"
        >
          <LogoMark />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            JobTrack
          </span>
        </Link>

        {/* Tengah: Navigasi desktop */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative rounded py-1 text-sm font-medium text-sky-100 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {item.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-white transition-transform duration-150 group-hover:scale-x-100"
                />
            </Link>
          ))}
        </nav>

        {/* Kanan: Auth desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium text-sky-100 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-neutral-900 transition-colors duration-150 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 active:bg-neutral-100"
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

      {/* Mobile: panel menu */}
      {open && (
        <div className="mx-auto mt-2 w-full max-w-3xl rounded-3xl border border-neutral-200/80 bg-white p-4 shadow-lg md:hidden">
          <nav aria-label="Navigasi mobile" className="w-full space-y-1">
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
