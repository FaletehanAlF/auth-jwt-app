import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import FeatureCard from "../../components/FeatureCard";
import Footer from "../../components/Footer";

const features: { title: string; desc: string; icon: ReactNode }[] = [
  {
    title: "Application Tracking",
    desc: "Keep track of every job application in one place.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
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
    ),
  },
  {
    title: "Interview Management",
    desc: "Stay organized and keep important interview information within reach.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M8 3v3.5M16 3v3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M7.5 13.5h3M7.5 16.5h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Career Progress",
    desc: "Keep your job search organized and see your progress clearly.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <path
          d="M4 19.5h16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M6.5 16.5v-5M12 16.5V8M17.5 16.5v-8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const pipelineStages = [
  { name: "Applied", note: "Submitted", dot: "bg-teal-400" },
  { name: "Interview", note: "Scheduled", dot: "bg-cyan-300" },
  { name: "Offer", note: "Pending", dot: "bg-white/40" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip bg-neutral-950 text-white">
      <div className="relative w-full max-w-full overflow-x-clip">
        <Navbar activePage="home" />

        <main className="w-full max-w-full overflow-x-clip">
          {/* Hero — pakai img network, bawah ada pembatas. Konten bawah tidak pakai img. */}
          <section className="relative w-full max-w-full overflow-hidden">
            {/* Background network image khusus hero */}
            <div aria-hidden="true" className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1920&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
              />
              {/* Overlay supaya teks tetap terbaca */}
              <div className="absolute inset-0 bg-neutral-950/70" />
              <div className="absolute inset-0 bg-gradient-to-b from-teal-950/60 via-teal-950/40 to-neutral-950" />
            </div>

            <div className="relative mx-auto w-full max-w-5xl px-4 pb-12 pt-14 text-center sm:px-6 sm:pt-20 lg:pb-16">
              <h1 className="mx-auto mt-0 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Tracking that flows
                <br />
                with your career.
              </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              JobTrack brings your job applications, interviews, and career
              progress into one place — beautifully and effortlessly.
            </p>

            <Link
              href="/applications"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-teal-200 px-6 text-sm font-medium text-neutral-950 transition-colors duration-150 hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              Start Tracking
              <span aria-hidden="true">→</span>
            </Link>

            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 text-left sm:justify-center"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-teal-200 ring-1 ring-white/15">
                    {feature.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold tracking-[0.14em] text-white">
                      {feature.title.toUpperCase()}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-white/60">
                      {feature.desc}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-3xl border-t border-white/10 pt-6">
              <p className="text-[11px] font-medium tracking-[0.2em] text-white/50">
                APPLICATION PIPELINE
              </p>
              <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {pipelineStages.map((stage) => (
                  <li
                    key={stage.name}
                    className="flex min-w-0 items-center gap-2.5"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 shrink-0 rounded-full ${stage.dot}`}
                    />
                    <span className="text-sm font-medium text-white">
                      {stage.name}
                    </span>
                    <span className="text-xs text-white/55">{stage.note}</span>
                  </li>
                ))}
              </ul>
            </div>
            </div>

            {/* Pembatas hero */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="h-6 w-full bg-gradient-to-b from-white/10 to-transparent" />
            </div>
          </section>

          {/* Konten bawah — tanpa img network, background solid */}
          <div className="relative w-full max-w-full bg-gradient-to-b from-neutral-950 via-teal-950 to-neutral-950">
            <section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-12 sm:px-6 lg:pb-16">
            <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need to manage your job search
            </h2>
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  desc={feature.desc}
                  icon={feature.icon}
                />
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
            <div className="rounded-lg border border-white/10 bg-neutral-950 px-6 py-10 text-center sm:px-10 sm:py-12">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Stay organized.
                <br />
                Keep moving forward.
              </h2>
              <Link
                href="/applications"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-medium text-neutral-900 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                Start Tracking
              </Link>
            </div>
          </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
