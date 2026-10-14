import Link from "next/link";
import Reveal from "./Reveal";
import SplitText from "./SplitText";

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
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
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m7 10.2 2.1 2.1L13.2 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const AUDIENCES = [
  {
    title: "Untuk jobseeker",
    desc: "Temukan peluang yang sesuai dengan profil dan keahlianmu.",
  },
  {
    title: "Untuk recruiter",
    desc: "Kelola lowongan dan kandidat dalam satu tempat yang rapi.",
  },
];

export default function LandingAbout() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative w-full max-w-full overflow-x-clip bg-white"
    >
      {/* Subtle ambient wash — decorative only */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-lime-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.02fr_1fr] lg:gap-20 lg:py-28">
        {/* Copy — first in DOM for logical reading order, right on desktop.
            Muncul dari kanan saat di-scroll (AOS-like). */}
        <div className="order-1 w-full max-w-xl justify-self-start lg:order-2">
          <Reveal direction="right" delay={0}>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
              <span aria-hidden="true" className="h-px w-8 bg-sky-600/60" />
              A Bit About JobTrack
            </p>
          </Reveal>

          <Reveal direction="right" delay={90}>
            <h2
              id="about-heading"
              className="mt-5 font-display text-4xl font-semibold leading-[1.06] tracking-tight text-balance text-neutral-900 sm:text-5xl"
            >
              <SplitText text="Connecting Talent" direction="right" charDelay={14} />
              <br className="hidden sm:block" />{" "}
              <SplitText text="With " direction="right" charDelay={14} delayStart={200} />
              <span className="text-blue-600">
                <SplitText
                  text="Opportunity"
                  direction="left"
                  charDelay={14}
                  delayStart={280}
                />
              </span>
            </h2>
          </Reveal>

          <Reveal direction="right" delay={170}>
            <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-600">
              JobTrack membantu jobseeker menemukan peluang karier dan membantu
              recruiter mengelola lowongan serta menemukan kandidat dengan lebih
              mudah.
            </p>
          </Reveal>

          <Reveal direction="right" delay={230}>
            <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-600">
              Kami membangun pengalaman recruitment yang lebih sederhana,
              terstruktur, dan mudah digunakan oleh kedua sisi.
            </p>
          </Reveal>

          <Reveal direction="right" delay={290}>
            <ul className="mt-8 space-y-4">
              {AUDIENCES.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <p className="text-sm leading-relaxed text-neutral-600">
                    <span className="font-semibold text-neutral-900">
                      {item.title}
                    </span>{" "}
                    &mdash; {item.desc}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal direction="right" delay={350}>
            <div className="mt-10">
              <Link
                href="/home"
                className="group inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_-12px_rgba(37,99,235,0.6)] transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:bg-blue-700"
              >
                Explore Jobs
                <ArrowIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Visual composition — muncul dari kiri saat di-scroll.
            Pure CSS product illustration, decorative. */}
        <Reveal
          direction="left"
          delay={120}
          className="order-2 w-full max-w-md justify-self-center lg:order-1 lg:max-w-none"
        >
          <div
            aria-hidden="true"
            className="relative rounded-[2rem] border border-neutral-100 bg-gradient-to-b from-neutral-50 to-white p-5 shadow-[0_32px_70px_-40px_rgba(2,60,120,0.35)] sm:p-7"
          >
            {/* dot texture */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(2,60,120,0.10) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
                maskImage:
                  "linear-gradient(to bottom, black 55%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 55%, transparent 100%)",
              }}
            />

            {/* Main card — job posting */}
            <div className="relative rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_20px_50px_-30px_rgba(2,60,120,0.4)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
                    <BriefcaseIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      Product Designer
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Remote &middot; Full-time
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
                  Baru
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-600">
                  Figma
                </span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-600">
                  Design System
                </span>
                <span className="rounded-full bg-lime-200/70 px-3 py-1 text-[11px] font-medium text-neutral-800">
                  Remote
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
                <span className="text-sm font-medium text-blue-600">
                  Lihat detail
                </span>
                <ArrowIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>

            {/* Stacked card — applicant profile */}
            <div className="relative z-10 ml-8 -mt-3 rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_24px_55px_-28px_rgba(2,60,120,0.45)] sm:ml-14">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                  AP
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Alya P.
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Frontend Developer
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-neutral-500">
                    Profil siap dilamar
                  </p>
                  <CheckIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full w-5/6 rounded-full bg-blue-600" />
                </div>
              </div>
            </div>

            {/* Floating status pill */}
            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-neutral-100 bg-white py-2 pl-2.5 pr-4 shadow-[0_16px_40px_-20px_rgba(2,60,120,0.4)] sm:right-5 sm:top-5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-300 text-neutral-900">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                >
                  <path
                    d="m2.5 6.2 2.4 2.4 4.6-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-xs font-semibold text-neutral-900">
                Lamaran terkirim
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
