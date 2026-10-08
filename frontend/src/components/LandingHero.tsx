import Link from "next/link";
import LandingHeroCarousel from "./LandingHeroCarousel";
import TechText from "./TechText";

export default function LandingHero() {
  return (
    <section className="relative">
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-sky-600 via-sky-500 to-sky-300 px-4 pb-16 pt-28 text-center sm:px-10">
        {/* Dekorasi awan halus */}
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute left-[-6rem] top-10 h-40 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute right-[-5rem] top-1/3 h-44 w-80 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute bottom-[-6rem] left-1/3 h-48 w-96 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative flex w-full max-w-3xl flex-col items-center">
          <p className="animate-hero-fade-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lime-300" />
            Your career, your way
          </p>

          <h1 className="mt-6 w-full font-display">
            <span className="block h-14 sm:h-20 lg:h-24">
              <TechText
                text="Temukan Pekerjaan yang Tepat"
                fontWeight={700}
                fontSize={64}
                color="#ffffff"
                accentColor="#bef264"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={15}
              />
            </span>
            <span className="block h-14 text-sky-100 sm:h-20 lg:h-24">
              <TechText
                text="untuk Langkah Kariermu"
                fontWeight={700}
                fontSize={64}
                color="#e0f2fe"
                accentColor="#bef264"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={15}
              />
            </span>
          </h1>

          <p
            className="animate-hero-fade-up mt-5 max-w-xl text-balance text-sm leading-relaxed text-sky-50/90 sm:text-base"
            style={{ animationDelay: "160ms" }}
          >
            Cari peluang kerja, temukan kesempatan baru, dan mulai perjalanan
            kariermu bersama JobTrack.
          </p>

          {/* Search bar (UI only, tanpa logic/API) */}
          <form
            action="/home"
            method="get"
            role="search"
            className="animate-hero-fade-up mt-8 w-full max-w-xl"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white p-2 shadow-[0_16px_40px_-20px_rgba(2,60,120,0.5)] transition-colors duration-150 focus-within:border-sky-200 sm:flex-row sm:items-center">
              <div className="flex h-12 flex-1 items-center gap-2.5 px-3">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-neutral-400"
                >
                  <circle
                    cx="9"
                    cy="9"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="m13.5 13.5 3 3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="search"
                  name="q"
                  placeholder="Cari posisi atau keahlian..."
                  aria-label="Cari posisi atau keahlian"
                  className="h-full w-full min-w-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-neutral-900 px-7 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950 sm:w-auto"
              >
                Cari
              </button>
            </div>
          </form>

          <div
            className="animate-hero-fade-up mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
            style={{ animationDelay: "300ms" }}
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
            className="animate-hero-fade-up mt-10 w-full max-w-4xl"
            style={{ animationDelay: "380ms" }}
          >
            <LandingHeroCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
