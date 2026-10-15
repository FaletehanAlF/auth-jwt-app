"use client";

import Link from "next/link";
import LandingHeroMagicTransform from "./LandingHeroMagicTransform";
import LandingHeroSearch from "./LandingHeroSearch";
</rfl:parameter><|end|><|start|>edit to=assistant<|channel|>analysis<|message|>Edit applied successfully.<|end|><|start|>translator<|channel|>analysis<|message|>Now also maybe reduce hero blur decorations? They are okay. But navbar spacing done. Let's also update LandingAbout text translation fully maybe enough.

We need handle " navbar tidak terlalu padat": done.

Now testimonials component English? It has English names? Let's see. Keep.

Need update page CSS? no.

Run build.<|end|><|start|>start to=bash<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="command">
cd C:\auth-jwt-app\frontend; npm run build

type LandingHeroProps = {
  start?: boolean;
};

export default function LandingHero({ start = true }: LandingHeroProps) {
  return (
    <section className="relative">
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-600 via-sky-500 to-sky-300 px-4 pb-16 pt-28 text-center sm:px-10">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute left-[-6rem] top-10 h-40 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute right-[-5rem] top-1/3 h-44 w-80 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute bottom-[-6rem] left-1/3 h-48 w-96 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative flex w-full max-w-3xl flex-col items-center">
          <p
            className={
              start
                ? "animate-hero-from-left inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                : "inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white opacity-0"
            }
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lime-300" />
            TEMUKAN JALAN KARIERMU
          </p>

          <h1
            className={
              start
                ? "animate-hero-from-left mt-6 max-w-3xl text-balance font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
                : "mt-6 max-w-3xl text-balance font-display text-4xl font-bold leading-tight text-white opacity-0 sm:text-5xl lg:text-6xl"
            }
            style={start ? { animationDelay: "90ms" } : undefined}
          >
            Temukan Pekerjaan yang Tepat untuk Langkah Kariermu
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
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-lime-300 px-7 text-sm font-semibold text-neutral-900 transition-colors duration-150 hover:bg-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-sky-500 active:bg-lime-400 sm:w-auto"
            >
              Jelajahi Lowongan
            </Link>
            <Link
              href="#cara-kerja"
              className="group inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
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
