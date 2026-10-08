import LandingNavbar from "../components/LandingNavbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <LandingNavbar />
      {/* Hero dan section landing lainnya belum dibuat (di luar scope navbar). */}
      <main className="min-h-[40vh]" />
    </div>
  );
}
