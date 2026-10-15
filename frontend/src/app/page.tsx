"use client";

import { useCallback, useEffect, useState } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingHero from "../components/landing/LandingHero";
import JobTrackLoader from "../components/landing/JobTrackLoader";
import LogoLoop from "../components/ui/LogoLoop";
import Reveal from "../components/ui/Reveal";
import SplitText from "../components/ui/SplitText";
import { TRUSTED_LOGOS } from "../data/trustedLogos";
import LandingAbout from "../components/landing/LandingAbout";
import LandingHowItWorks from "../components/landing/LandingHowItWorks";
import LandingTestimonials from "../components/landing/LandingTestimonials";
import LandingContact from "../components/landing/LandingContact";
import Footer from "../components/landing/Footer";

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
            <div
              style={{
                height: "64px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <LogoLoop
                logos={TRUSTED_LOGOS}
                speed={60}
                direction="left"
                logoHeight={40}
                gap={48}
                fadeOut
                fadeOutColor="#ffffff"
                ariaLabel="Perusahaan yang mempercayai kami"
              />
            </div>
          </div>
          </Reveal>
        </section>
        <LandingAbout />
        <LandingHowItWorks />
        <LandingTestimonials />
        <LandingContact />
      </main>
      <Footer />
    </div>
  );
}
