import type { ReactNode } from "react";
import Link from "next/link";
import SiteMenu from "../../components/SiteMenu";
import FeatureCard from "../../components/FeatureCard";
import Footer from "../../components/Footer";
import LogoLoop from "../../components/LogoLoop";
import { TRUSTED_LOGOS } from "../../data/trustedLogos";
import CircularGallery, { type GalleryItem } from "../../components/CircularGallery";

const features: { title: string; desc: string; icon: ReactNode }[] = [
  {
    title: "Pelacakan Lamaran",
    desc: "Pantau setiap lamaran kerjamu dalam satu tempat.",
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
    title: "Manajemen Wawancara",
    desc: "Tetap rapi dan simpan informasi wawancara penting dalam jangkauan.",
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
    title: "Progres Karier",
    desc: "Atur pencarian kerjamu dan lihat progresmu dengan jelas.",
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

const GALLERY_ITEMS: GalleryItem[] = [
  { image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop", text: "Kerja Tim" },
  { image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop", text: "Kolaborasi" },
  { image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop", text: "Rapat" },
  { image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop", text: "Ruang Kerja" },
  { image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=800&auto=format&fit=crop", text: "Wawancara" },
  { image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop", text: "Presentasi" },
  { image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=800&auto=format&fit=crop", text: "Diskusi" },
  { image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop", text: "Karier" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip overscroll-none bg-neutral-950 text-white">
      <div className="relative w-full max-w-full overflow-x-clip overscroll-none">
        {}
        <SiteMenu />

        <main className="w-full max-w-full overflow-x-clip overscroll-none">
          {}
          {}
          <section className="relative flex min-h-[110svh] w-full max-w-full overflow-hidden">
            {}
            <div aria-hidden="true" className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1920&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
              />
              {/* Overlay flat hitam tanpa gradient agar teks tetap terbaca */}
              <div className="absolute inset-0 bg-neutral-950/70" />
            </div>

            <div className="relative m-auto w-full max-w-5xl px-4 py-40 text-center sm:px-6 sm:py-48 lg:py-56">
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
              href="/profile"
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              Start Tracking
              <span aria-hidden="true">→</span>
            </Link>
            </div>

            {/* Pembatas solid tanpa gradient */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0">
              <div className="h-px w-full bg-white/10" />
            </div>
          </section>

          {}
          <section className="relative w-full max-w-full overflow-hidden bg-neutral-950">
            <div className="mx-auto w-full max-w-5xl px-4 pt-10 text-center sm:px-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                Telah dipercayai oleh
              </p>
            </div>
            {}
            <div className="w-full max-w-full pb-12 pt-6 mt-8">
              <div style={{ height: "96px", position: "relative", overflow: "hidden" }}>
                <LogoLoop
                  logos={TRUSTED_LOGOS}
                  speed={60}
                  direction="left"
                  logoHeight={64}
                  gap={80}
                  hoverSpeed={0}
                  fadeOut
                  fadeOutColor="#0a0a0a"
                  ariaLabel="Perusahaan yang mempercayai kami"
                  className="logoloop--grayscale logoloop--square"
                />
              </div>
            </div>
          </section>

          {}
          <section className="relative w-full max-w-full overflow-hidden bg-neutral-950">
            <div className="mx-auto w-full max-w-5xl px-4 pt-12 text-center sm:px-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Moments from our community
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-white/60">
                Drag, scroll, atau pakai tombol panah kiri / kanan untuk menjelajah.
              </p>
            </div>
            {}
            <div style={{ height: "600px", position: "relative" }}>
              <CircularGallery
                items={GALLERY_ITEMS}
                bend={3}
                textColor="#ffffff"
                borderRadius={0.05}
                scrollEase={0.02}
                scrollSpeed={2}
                font="bold 30px Poppins"
              />
            </div>
          </section>

          {}
          <div className="relative w-full max-w-full bg-gradient-to-b from-neutral-950 via-blue-950 to-neutral-950">
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
                href="/profile"
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
