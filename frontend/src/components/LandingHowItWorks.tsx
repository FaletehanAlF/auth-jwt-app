import Link from "next/link";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";

const CARD_CLASS =
  "flex min-h-[62vh] flex-col justify-center rounded-[1.75rem] border border-neutral-200/80 bg-white p-6 shadow-[0_32px_70px_-40px_rgba(2,60,120,0.4)] transition-[box-shadow,border-color] duration-200 hover:border-sky-200 hover:shadow-[0_36px_80px_-40px_rgba(2,60,120,0.45)] sm:min-h-[60vh] sm:rounded-[2rem] sm:p-10";

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

function DocIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M7 3.5h7l4 4v13H7v-17Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.5v4h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12.5h5M9.5 15.5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="16.5" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16 14.7c2.2.3 3.8 1.9 4.3 4.3"
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

function StepNumber({ children }: { children: string }) {
  return (
    <span className="step-number inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 font-display text-sm font-bold text-white transition-colors duration-300">
      {children}
    </span>
  );
}

export default function LandingHowItWorks() {
  return (
    <section
      id="cara-kerja"
      aria-labelledby="how-heading"
      className="relative w-full max-w-full overflow-x-clip bg-neutral-50"
    >
      {/* Ambient dekoratif — murni visual, tidak mengganggu animasi stack */}
      <div aria-hidden="true" className="how-ambient">
        <div className="how-blob how-blob-a" />
        <div className="how-blob how-blob-b" />
      </div>
      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        {/* Header section — scroll normal seperti semula */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
            <span aria-hidden="true" className="h-px w-8 bg-sky-600/60" />
            Cara Kerja JobTrack
            <span aria-hidden="true" className="h-px w-8 bg-sky-600/60" />
          </p>
          <h2
            id="how-heading"
            className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-balance text-neutral-900 sm:text-4xl lg:text-5xl"
          >
            Langkah sederhana menuju{" "}
            <span className="text-blue-600">peluang berikutnya.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-600">
            Temukan pekerjaan yang sesuai, kirim lamaran, dan biarkan
            recruiter meninjau kandidat melalui satu platform.
          </p>
        </div>

        {/* Stack */}
        <div className="mx-auto mt-14 w-full max-w-4xl sm:mt-16">
          <ScrollStack
            itemDistance={240}
            itemScale={0.05}
            itemStackDistance={12}
            stackPosition="18%"
            scaleEndPosition="10%"
            baseScale={0.85}
            rotationAmount={0}
            blurAmount={0}
            useWindowScroll
          >
            {/* Kartu 1 — Temukan Peluang */}
            <ScrollStackItem key="cara-kerja-temukan-peluang" itemClassName={CARD_CLASS}>
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
                <div>
                  <StepNumber>01</StepNumber>
                  <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                    Temukan peluang yang tepat
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
                    Jelajahi lowongan pekerjaan, baca detail posisi, dan
                    temukan kesempatan yang sesuai dengan minat serta
                    kemampuanmu.
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
                  <div className="flex items-center gap-3">
                    <span className="how-float flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
                      <BriefcaseIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        Frontend Developer
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        TechNova Indonesia &middot; Jakarta
                      </p>
                    </div>
                    <span className="ml-auto shrink-0 rounded-full bg-lime-200/70 px-3 py-1 text-[11px] font-semibold text-neutral-800">
                      Full-time
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200/70">
                      React
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200/70">
                      TypeScript
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-600 ring-1 ring-neutral-200/70">
                      Remote
                    </span>
                  </div>
                  <div className="mt-4 border-t border-neutral-200/70 pt-4">
                    <Link
                      href="/home"
                      className="group inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full bg-blue-600 px-5 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:bg-blue-700"
                    >
                      Jelajahi Lowongan
                      <ArrowIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollStackItem>

            {/* Kartu 2 — Kirim Lamaran */}
            <ScrollStackItem key="cara-kerja-kirim-lamaran" itemClassName={CARD_CLASS}>
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
                <div>
                  <StepNumber>02</StepNumber>
                  <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                    Kirim lamaran dengan mudah
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
                    Setelah menemukan pekerjaan yang cocok, buka detail
                    lowongan dan kirim lamaran melalui JobTrack.
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
                  <div className="flex items-center gap-3">
                    <span className="how-float flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white">
                      <DocIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        Frontend Developer
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        TechNova Indonesia
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-100 bg-white px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-300 text-neutral-900">
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
                    <p className="text-xs font-semibold text-neutral-900">
                      Lamaran terkirim
                    </p>
                  </div>
                  <ol className="mt-4 flex items-center gap-2">
                    {["Dikirim", "Ditinjau", "Wawancara"].map((step, i) => (
                      <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
                        <span
                          className={`h-1.5 flex-1 rounded-full ${
                            i === 0 ? "bg-blue-600" : "bg-neutral-200"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="sr-only">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-2 flex justify-between text-[11px] font-medium text-neutral-500">
                    <span className="text-neutral-900">Dikirim</span>
                    <span>Ditinjau</span>
                    <span>Wawancara</span>
                  </div>
                </div>
              </div>
            </ScrollStackItem>

            {/* Kartu 3 — Kelola Rekrutmen */}
            <ScrollStackItem key="cara-kerja-kelola-rekrutmen" itemClassName={CARD_CLASS}>
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
                <div>
                  <StepNumber>03</StepNumber>
                  <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                    Kelola proses rekrutmen
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
                    Recruiter dapat membuat dan mengelola lowongan,
                    memperbarui informasi pekerjaan, serta melihat kandidat
                    yang melamar.
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
                  <div className="flex items-center gap-3">
                    <span className="how-float flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
                      <UsersIcon className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-semibold text-neutral-900">
                      Lowongan saya
                    </p>
                  </div>
                  <ul className="mt-4 space-y-3">
                    <li className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          Frontend Developer
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Kandidat menunggu peninjauan
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
                        Aktif
                      </span>
                    </li>
                    <li className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          UI Designer
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Lengkapi detail sebelum dipublikasi
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-600">
                        Draf
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>
      </div>
    </section>
  );
}
