import LandingNavbar from "../../components/LandingNavbar";
import LandingAbout from "../../components/LandingAbout";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip bg-white text-neutral-900">
      <div className="relative min-h-[120px] w-full max-w-full overflow-x-clip bg-gradient-to-b from-sky-600 via-sky-500 to-sky-300">
        <LandingNavbar />
      </div>

      <LandingAbout />

      <Footer />
    </div>
  );
}
