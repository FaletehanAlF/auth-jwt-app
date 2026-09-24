import type { ReactNode } from "react";
import Link from "next/link";
import ShapeGrid from "../../components/ShapeGrid";
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
  { name: "Applied", note: "Submitted", dot: "bg-teal-500" },
  { name: "Interview", note: "Scheduled", dot: "bg-cyan-500" },
  { name: "Offer", note: "Pending", dot: "bg-slate-400" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-linear-to-tr from-teal-800 via-teal-950 to-neutral-950 text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <ShapeGrid
          direction="diagonal"
          speed={0.4}
          squareSize={44}
          borderColor="rgba(94, 234, 212, 0.22)"
          hoverFillColor="rgba(45, 212, 191, 0.35)"
          shape="square"
          hoverTrailAmount={5}
        />
      </div>
      <div className="relative">
        <Navbar activePage="home" />

        <main>
          <section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:pb-16">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div className="min-w-0">
                <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                  YOUR CAREER,
                  <br />
                  ORGANIZED.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                  Keep your job applications, interviews, and career progress
                  organized in one place.
                </p>
                <Link
                  href="/applications"
                  className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-teal-400 px-6 text-sm font-medium text-neutral-950 transition-colors duration-150 hover:bg-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  Start Tracking
                </Link>
              </div>

              <div className="min-w-0 rounded-lg border border-white/10 bg-neutral-950 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold tracking-tight text-white">
                    Application pipeline
                  </p>
                  <p className="text-xs text-white/60">All stages in one view</p>
                </div>
                <ul className="mt-5 space-y-3">
                  {pipelineStages.map((stage) => (
                    <li
                      key={stage.name}
                      className="flex items-center gap-3 rounded-lg border border-white/10 px-3.5 py-3"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${stage.dot}`}
                      />
                      <span className="text-sm font-medium text-white">{stage.name}</span>
                      <span className="ml-auto text-xs text-white/60">
                        {stage.note}
                      </span>
                    </li>
                  ))}
                </ul>
                <div aria-hidden="true" className="mt-5 flex gap-1.5">
                  <span className="h-1.5 flex-1 rounded-full bg-teal-400" />
                  <span className="h-1.5 flex-1 rounded-full bg-cyan-400" />
                  <span className="h-1.5 flex-1 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 lg:pb-16">
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
        </main>

        <Footer />
      </div>
    </div>
  );
}
