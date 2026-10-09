"use client";

import { useCallback, useEffect, useState } from "react";
import LandingNavbar from "../components/LandingNavbar";
import LandingHero from "../components/LandingHero";
import JobTrackLoader from "../components/JobTrackLoader";
import LogoLoop from "../components/LogoLoop";
import Reveal from "../components/Reveal";
import SplitText from "../components/SplitText";
import { TRUSTED_LOGOS } from "../data/trustedLogos";
import LandingAbout from "../components/LandingAbout";
import LandingHowItWorks from "../components/LandingHowItWorks";
import LandingTestimonials from "../components/LandingTestimonials";
import Footer from "../components/Footer";

// Flag in-memory (bukan sessionStorage): refresh/full-reload mengulang
// animasi loader sama seperti masuk pertama kali; navigasi client-side
// dalam sesi yang sama tetap melewati loader. Reset otomatis saat reload.
let landingLoaderSeen = false;

export default function LandingPage() {
  // Loader tampil di atas hero; entrance hero dimulai MENJELANG loader
  // selesai terangkat (bukan saat mulai naik) agar tidak tabrakan.
  const [showLoader, setShowLoader] = useState(true);
  const [heroStart, setHeroStart] = useState(false);

  useEffect(() => {
    // Navigasi client-side internal: lewati loader, hero langsung jalan.
    // Refresh/full-reload: flag kembali false → animasi diputar penuh lagi.
    // Dijadwalkan async agar bukan setState sinkron di body effect.
    const id = window.setTimeout(() => {
      if (landingLoaderSeen) {
        setShowLoader(false);
        setHeroStart(true);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleLoaderReveal = useCallback(() => {
    setHeroStart(true);
  }, []);

  const handleLoaderDone = useCallback(() => {
    landingLoaderSeen = true;
    setShowLoader(false);
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip bg-white font-sans text-neutral-900 antialiased">
      {showLoader && (
        <JobTrackLoader
          onReveal={handleLoaderReveal}
          onDone={handleLoaderDone}
        />
      )}
      <LandingNavbar />
      <main>
        <LandingHero start={heroStart} />
        <section className="relative w-full max-w-full overflow-hidden bg-white pb-12">
          <div className="mx-auto w-full max-w-5xl px-4 pt-10 text-center sm:px-6">
            <Reveal direction="left" delay={0}>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                <SplitText
                  text="Telah dipercayai oleh"
                  direction="left"
                  charDelay={14}
                />
              </p>
            </Reveal>
          </div>
          <Reveal direction="right" delay={100}>
          <div className="mt-8 w-full max-w-full pb-4 pt-6">
            <div style={{ height: "96px", position: "relative", overflow: "hidden" }}>
              <LogoLoop
                logos={TRUSTED_LOGOS}
                speed={60}
                direction="left"
                logoHeight={64}
                gap={80}
                pauseOnHover={false}
                fadeOut
                fadeOutColor="#ffffff"
                ariaLabel="Perusahaan yang mempercayai kami"
                className="logoloop--grayscale logoloop--square logo-auto-run"
              />
            </div>
          </div>
          </Reveal>
        </section>
        <LandingAbout />
        <LandingHowItWorks />
        <LandingTestimonials />
      </main>
      <Footer />
    </div>
  );
}
