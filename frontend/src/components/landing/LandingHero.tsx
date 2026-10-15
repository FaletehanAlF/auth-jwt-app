"use client";

import Link from "next/link";
import LandingHeroMagicTransform from "./LandingHeroMagicTransform";
import LandingHeroSearch from "./LandingHeroSearch";
import TechText from "../ui/TechText";

type LandingHeroProps = {
  start?: boolean;
};

export default function LandingHero({ start = true }: LandingHeroProps) {
  return (
    <section className="relative">
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-600 via-sky-500 to-sky-300 px-4 pb-16 pt-28 text-center sm:px-10">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute left-[-10rem] top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-[-8rem] bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative flex w-full max-w-3xl flex-col items-center">
          <p
            className={
              start
                ? "animate-hero-from-left inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                : "inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white opacity-0"
            }
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lime-300" />
            TEMUKAN JALAN KARIERMU
          </p>

          <h1
            className={
              start
                ? "animate-hero-from-left mt-6 w-full max-w-3xl font-display"
                : "mt-6 w-full max-w-3xl font-display opacity-0"
            }
            style={start ? { animationDelay: "90ms" } : undefined}
          >
            <span className="block h-12 sm:h-16 lg:h-20">
              <TechText
                text="Temukan Pekerjaan yang Tepat"
                fontWeight={700}
                fontSize={56}
                color="#ffffff"
                accentColor="#7dd3fc"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={0}
                labels={false}
                paused={!start}
              />
            </span>
            <span className="block h-12 text-sky-100 sm:h-16 lg:h-20">
              <TechText
                text="untuk Langkah Kariermu"
                fontWeight={700}
                fontSize={56}
                color="#e0f2fe"
                accentColor="#7dd3fc"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={0}
                labels={false}
                paused={!start}
              />
            </span>
          </h1>

          <p
            className={
              start
                ? "animate-hero-from-right mt-5 max-w-xl text-balance text-sm leading-relaxed text-sky-50/90 sm:text-base"
                : "mt-5 max-w-xl text-balance text-sm leading-relaxed text-sky-50/90 opacity-0 sm:text-base"
            }
            style={start ? { animationDelay: "180ms" } : undefined}
          >
            Cari peluang kerja yang sesuai dengan keahlianmu dan temukan
            kesempatan baru untuk mengembangkan karier bersama JobTrack.
          </p>

          <div
            className={
              start
                ? "animate-hero-fade-up mt-8 w-full max-w-xl"
                : "mt-8 w-full max-w-xl opacity-0"
            }
            style={start ? { animationDelay: "240ms" } : undefined}
          >
            <LandingHeroSearch />
          </div>

          <div
            className={
              start
                ? "animate-hero-from-right mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
                : "mt-6 flex w-full flex-col items-center justify-center gap-3 opacity-0 sm:w-auto sm:flex-row"
            }
            style={start ? { animationDelay: "300ms" } : undefined}
          >
            <Link
              href="/home"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-sky-900 shadow-sm transition-colors duration-150 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sky-600 active:bg-sky-100 sm:w-auto"
            >
              Jelajahi Lowongan
            </Link>
            <Link
              href="#cara-kerja"
              className="group inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full border border-white/40 bg-transparent px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              Lihat Cara Kerja
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
              >
                <path
                  d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          <div
            className={
              start
                ? "animate-hero-fade-up mt-10 w-full max-w-3xl"
                : "mt-10 w-full max-w-3xl opacity-0"
            }
            style={start ? { animationDelay: "380ms" } : undefined}
          >
            <LandingHeroMagicTransform />
          </div>

        </div>
      </div>
    </section>
  );
}
