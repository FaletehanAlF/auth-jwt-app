import LandingNavbar from "../components/LandingNavbar";
import LandingHero from "../components/LandingHero";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <LandingNavbar />
      <main>
        <LandingHero />
      </main>
    </div>
  );
}
