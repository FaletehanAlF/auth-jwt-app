import Link from "next/link";
import SiteMenu from "../../components/SiteMenu";
import Footer from "../../components/Footer";

const VALUES = [
  {
    title: "Sederhana",
    desc: "Satu tempat untuk setiap peluang yang kamu kejar. Tanpa ribet, tanpa berantakan.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Fokus",
    desc: "Selalu tahu di tahap apa setiap lamaranmu berada — dari terkirim sampai wawancara.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Milikmu",
    desc: "Perjalanan kariermu, diatur dengan caramu sendiri. Rapi dan tetap terkendali.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <path d="M12 3.5 14.5 9l6 .5-4.6 3.9 1.4 5.8L12 15.7l-5.3 3.5 1.4-5.8L3.5 9.5l6-.5L12 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    no: "01",
    title: "Catat Lamaran",
    desc: "Simpan setiap pekerjaan yang kamu lamar beserta detail pentingnya.",
  },
  {
    no: "02",
    title: "Pantau Proses",
    desc: "Lihat status lamaran dan jadwal wawancaramu dengan jelas.",
  },
  {
    no: "03",
    title: "Terus Berkembang",
    desc: "Tetap terorganisir dan melangkah maju di setiap peluang.",
  },
];

const STATS = [
  { value: "3", label: "Fitur inti pelacakan" },
  { value: "1", label: "Dashboard terpadu" },
  { value: "100%", label: "Fokus pada kariermu" },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip overscroll-none bg-neutral-950 text-white">
      <div className="relative w-full max-w-full overflow-x-clip overscroll-none">
        <SiteMenu />

        <main className="w-full max-w-full overflow-x-clip overscroll-none">
          {/* Hero — clean, tanpa foto, aksen biru sesuai tema */}
          <section className="relative w-full overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0">
              <div className="absolute inset-0 bg-neutral-950" />
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                  backgroundSize: "44px 44px",
                  maskImage:
                    "radial-gradient(ellipse 80% 70% at 50% 0%, black 40%, transparent 75%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 80% 70% at 50% 0%, black 40%, transparent 75%)",
                }}
              />
              <div className="absolute left-1/2 top-[-8rem] h-80 w-[42rem] -translate-x-1/2 rounded-full bg-blue-700/25 blur-[120px]" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
            </div>

            <div className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-32 text-center sm:px-6 sm:pt-40">
              <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Tentang JobTrack
              </p>
              <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Satu tempat untuk seluruh perjalanan kariermu.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
                JobTrack membantumu merapikan lamaran kerja, wawancara, dan
                progres karier — semuanya dalam satu dashboard yang bersih
                dan mudah dipakai.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/profile"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:w-auto"
                >
                  Mulai Melacak
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/home"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-white/85 transition-colors duration-150 hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-auto"
                >
                  Kembali ke Beranda
                </Link>
              </div>

              <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
                  >
                    <dt className="order-2 mt-1 text-xs leading-relaxed text-white/55">
                      {stat.label}
                    </dt>
                    <dd className="order-1 font-display text-2xl font-semibold tracking-tight text-white">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* Misi */}
          <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="lg:sticky lg:top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Misi kami
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Kenapa JobTrack ada?
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
                  Mencari kerja itu melelahkan kalau semuanya tersebar.
                  JobTrack hadir agar kamu punya satu tempat yang rapi untuk
                  mencatat, memantau, dan menuntaskan setiap peluang.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {VALUES.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-150 hover:border-blue-500/30 sm:p-6"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                      {item.icon}
                    </span>
                    <h3 className="mt-4 font-display text-base font-semibold tracking-tight text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                      {item.desc}
                    </p>
                  </div>
                ))}
                <div className="rounded-2xl border border-blue-500/25 bg-blue-600/[0.08] p-5 sm:p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                      <path d="M4 12.5h16M13 6.5l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-tight text-white">
                    Siap mencoba?
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-blue-200/70">
                    Mulai dari profilmu dan rasakan bedanya dalam sekali pakai.
                  </p>
                  <Link
                    href="/profile"
                    className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-4 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-blue-500"
                  >
                    Ke Profil →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Cara kerja */}
          <section className="border-t border-white/10 bg-white/[0.015]">
            <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:py-20">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Cara kerja
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Sederhana dalam tiga langkah
                </h2>
              </div>
              <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {STEPS.map((step) => (
                  <li
                    key={step.no}
                    className="rounded-2xl border border-white/10 bg-neutral-950 p-5 sm:p-6"
                  >
                    <p className="font-display text-sm font-bold tracking-[0.2em] text-blue-400">
                      {step.no}
                    </p>
                    <h3 className="mt-3 font-display text-base font-semibold tracking-tight text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                      {step.desc}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* CTA */}
          <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-6 lg:pb-20">
            <div className="relative overflow-hidden rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-700 via-blue-800 to-neutral-950 px-6 py-12 text-center sm:px-10">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="relative">
                <h2 className="mx-auto max-w-xl font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Tetap terorganisir. Terus melangkah maju.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-blue-100/80">
                  Semua lamaran, wawancara, dan progres kariermu — rapi dalam
                  satu tempat.
                </p>
                <Link
                  href="/profile"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-blue-900 transition-colors duration-150 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-800"
                >
                  Mulai Melacak →
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
