import Link from "next/link";
import Reveal from "../ui/Reveal";
import SplitText from "../ui/SplitText";

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect
        x="2.5"
        y="4"
        width="19"
        height="12.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8.5 20.5h7M12 16.5v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect
        x="6.5"
        y="2.5"
        width="11"
        height="19"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M10.5 5.5h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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

export default function LandingPlatforms() {
  return (
    <section
      id="platform"
      aria-labelledby="platform-heading"
      className="relative w-full max-w-full scroll-mt-24 overflow-x-clip bg-neutral-50"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -right-20 bottom-16 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal direction="left" delay={0}>
            <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
              <span aria-hidden="true" className="h-px w-8 bg-sky-600/60" />
              Web &amp; Mobile
              <span aria-hidden="true" className="h-px w-8 bg-sky-600/60" />
            </p>
          </Reveal>

          <Reveal direction="right" delay={90}>
            <h2
              id="platform-heading"
              className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-balance text-neutral-900 sm:text-4xl lg:text-5xl"
            >
              <SplitText
                text="JobTrack lewat web,"
                direction="right"
                charDelay={12}
              />{" "}
              <span className="text-blue-600">
                <SplitText
                  text="segera hadir di mobile."
                  direction="left"
                  charDelay={12}
                  delayStart={150}
                />
              </span>
            </h2>
          </Reveal>

          <Reveal direction="left" delay={170}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-600">
              Semua fitur JobTrack sudah bisa kamu pakai lewat browser, di
              laptop maupun di ponsel. Versi mobile sedang kami persiapkan.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-14 grid w-full max-w-4xl gap-6 sm:mt-16 lg:grid-cols-2">
          <Reveal direction="right" delay={0} className="h-full">
            <article className="flex h-full flex-col rounded-[1.75rem] border border-neutral-200/80 bg-white p-6 shadow-[0_32px_70px_-40px_rgba(2,60,120,0.4)] sm:rounded-[2rem] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-600 text-white">
                  <MonitorIcon className="h-6 w-6" />
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-[11px] font-semibold text-lime-800">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lime-500" />
                  Tersedia
                </span>
              </div>

              <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                JobTrack Web
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Semua fitur JobTrack berjalan di browser — tanpa perlu
                instalasi apa pun. Buka lowongan, kirim lamaran, dan pantau
                progres dari perangkat yang kamu pakai sekarang.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Cari lowongan dan kirim lamaran",
                  "Pantau status lamaran dan interview",
                  "Insight karier dari riwayat lamaranmu",
                  "Kelola lowongan dan kandidat untuk recruiter",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700"
                    >
                      <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                        <path
                          d="m2.5 6.2 2.4 2.4 4.6-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm leading-relaxed text-neutral-600">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>

          <Reveal direction="left" delay={90} className="h-full">
            <article className="flex h-full flex-col rounded-[1.75rem] border border-dashed border-neutral-300 bg-white/70 p-6 sm:rounded-[2rem] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500">
                  <PhoneIcon className="h-6 w-6" />
                </span>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-900">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Segera hadir
                </span>
              </div>

              <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                JobTrack Mobile
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                Versi mobile sedang kami persiapkan, dengan tampilan yang
                dibuat khusus untuk layar ponsel.
              </p>

              <p className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-3.5 text-sm leading-relaxed text-neutral-500">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
                >
                  <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3">
                    <circle cx="6" cy="6" r="4.4" stroke="currentColor" strokeWidth="1.4" />
                    <path
                      d="M6 3.4v2.8l1.8 1.1"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span>
                  Belum ada aplikasi yang bisa diunduh atau diinstal. Untuk
                  sekarang semua fitur tetap tersedia lewat web.
                </span>
              </p>
            </article>
          </Reveal>
        </div>

        <Reveal direction="up" delay={120}>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/login"
              className="group inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_30px_-12px_rgba(37,99,235,0.6)] transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:bg-blue-700 sm:w-auto"
            >
              Masuk
              <ArrowIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#cara-kerja"
              className="group inline-flex min-h-[3rem] w-full items-center justify-center gap-1.5 rounded-full border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-800 transition-colors duration-150 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
            >
              Lihat Fitur
              <ArrowIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
