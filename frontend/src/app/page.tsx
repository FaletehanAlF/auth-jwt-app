import LandingNavbar from "../components/LandingNavbar";
import LandingHero from "../components/LandingHero";
import LogoLoop from "../components/LogoLoop";
import { TRUSTED_LOGOS } from "../data/trustedLogos";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <LandingNavbar />
      <main>
        <LandingHero />
        <section className="relative w-full max-w-full overflow-hidden bg-white pb-12">
          <div className="mx-auto w-full max-w-5xl px-4 pt-10 text-center sm:px-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Telah dipercayai oleh
            </p>
          </div>
          <div className="mt-8 w-full max-w-full pb-4 pt-6">
            <div style={{ height: "96px", position: "relative", overflow: "hidden" }}>
              <LogoLoop
                logos={TRUSTED_LOGOS}
                speed={60}
                direction="left"
                logoHeight={64}
                gap={80}
                hoverSpeed={0}
                fadeOut
                fadeOutColor="#ffffff"
                ariaLabel="Perusahaan yang mempercayai kami"
                className="logoloop--grayscale logoloop--square"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
