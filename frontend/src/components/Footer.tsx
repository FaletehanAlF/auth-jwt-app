import Link from "next/link";

const NAV_LINKS = [
  { label: "Beranda", href: "/home" },
  { label: "Lamaran", href: "/applications" },
  { label: "Profil", href: "/profile" },
];

const FEATURES = ["Pelacakan Lamaran", "Manajemen Wawancara", "Perkembangan Karier"];

const HELP = ["Tentang JobTrack", "Cara Kerja", "Bantuan"];

const CONTACT = ["Email", "LinkedIn", "GitHub"];

export default function Footer() {
  return (
    <footer className="w-full bg-transparent px-4 pb-10 sm:px-6">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 px-6 py-10 sm:px-10 sm:py-12">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1.9fr]">
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-white">
              JOBTRACK
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
              Platform sederhana untuk membantu kamu mengatur lamaran pekerjaan,
              wawancara, dan perjalanan karier dalam satu tempat.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                Navigasi
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {NAV_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="rounded text-white/70 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                Fitur
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {FEATURES.map((item) => (
                  <li key={item}>
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                Bantuan
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {HELP.map((item) => (
                  <li key={item}>
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                Kontak
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {CONTACT.map((item) => (
                  <li key={item}>
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/50">
              &copy; 2026 JobTrack. All rights reserved.
            </p>
            <p className="text-xs text-white/50">
              Career &amp; Job Application Tracker
            </p>
          </div>
        </div>

        <div aria-hidden="true" className="mt-8 select-none">
          <p className="text-center font-display text-[clamp(3rem,13.5vw,9.5rem)] font-bold uppercase leading-[0.9] tracking-tight text-teal-300/20">
            Jobtrack
          </p>
        </div>
      </div>
    </footer>
  );
}
