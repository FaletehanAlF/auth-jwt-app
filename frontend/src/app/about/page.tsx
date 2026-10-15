import Link from "next/link";
import Image from "next/image";
import LandingNavbar from "../../components/landing/LandingNavbar";
import Footer from "../../components/landing/Footer";
import Reveal from "../../components/ui/Reveal";
import SplitText from "../../components/ui/SplitText";

const ABOUT_MAIN_IMAGE_SRC = "";
const ABOUT_SECOND_IMAGE_SRC = "";

const HIGHLIGHTS = [
  {
    title: "Lowongan Terpusat",
    desc: "Kelola seluruh lowongan milikmu dalam satu daftar yang rapi dan mudah dipantau.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Pelamar Terorganisasi",
    desc: "Lihat kandidat yang melamar beserta CV-nya tanpa berpindah aplikasi.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 19.5c1.2-3 3.2-4.5 5.5-4.5s4.3 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16.5" cy="9.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 15.2c2 .3 3.6 1.6 4.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Status Lamaran Jelas",
    desc: "Perbarui status lamaran agar kamu dan recruiter selalu punya gambaran yang sama.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

function AboutImage({
  src,
  alt,
  label,
  className,
}: {
  src: string;
  alt: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-neutral-100 bg-sky-50 shadow-[0_24px_60px_-32px_rgba(2,60,120,0.35)] ${className ?? ""}`}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 520px" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
              <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.6" />
              <path d="m5.5 17.5 4.5-4.5 3 3 2.5-2.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="text-xs font-medium text-neutral-400">{label}</p>
        </div>
      )}
    </div>
  );
}

function FloatingCard({
  label,
  detail,
  dotClass,
  className,
}: {
  label: string;
  detail: string;
  dotClass: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-[0_16px_40px_-20px_rgba(2,60,120,0.35)] ${className ?? ""}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotClass}`} />
        <p className="text-xs font-semibold text-neutral-900">{label}</p>
      </div>
      <p className="mt-0.5 text-[11px] text-neutral-500">{detail}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip bg-white text-neutral-900">
      <div className="relative min-h-[120px] w-full max-w-full overflow-x-clip bg-gradient-to-b from-sky-600 via-sky-500 to-sky-300">
        <LandingNavbar />
      </div>

      <main className="w-full max-w-full overflow-x-clip">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-4 py-16 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:py-24">
          <Reveal direction="left" delay={0} className="w-full max-w-md lg:max-w-none">
            <div className="relative w-full">
              <AboutImage
                src={ABOUT_MAIN_IMAGE_SRC}
                alt="Profesional menggunakan JobTrack"
                label="Gambar utama (profesional mencari kerja)"
                className="aspect-[4/5] w-[78%]"
              />
              <AboutImage
                src={ABOUT_SECOND_IMAGE_SRC}
                alt="Proses rekrutmen di JobTrack"
                label="Gambar kedua (interview / rekrutmen)"
                className="absolute -bottom-8 right-0 aspect-square w-[52%] border-4 border-white"
              />
              <FloatingCard
                label="Kocokan Lowongan"
                detail="Rekomendasi sesuai keahlian"
                dotClass="bg-sky-500"
                className="-right-2 top-6"
              />
              <FloatingCard
                label="Profil Siap"
                detail="CV siap digunakan"
                dotClass="bg-sky-400"
                className="-left-2 bottom-14"
              />
              <FloatingCard
                label="Peluang Baru"
                detail="Lowongan baru tersedia"
                dotClass="bg-blue-600"
                className="right-6 -top-6 hidden sm:block"
              />
            </div>
          </Reveal>

          <div className="w-full max-w-xl">
            <Reveal direction="right" delay={0}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-600">
                Tentang JobTrack
              </p>
            </Reveal>
            <Reveal direction="right" delay={90}>
              <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.12] tracking-tight text-balance text-neutral-900 sm:text-5xl">
                <SplitText
                  text="Menghubungkan Talenta dengan Peluang"
                  direction="right"
                  charDelay={10}
                />
              </h1>
            </Reveal>
            <Reveal direction="right" delay={170}>
              <p className="mt-6 text-sm leading-relaxed text-neutral-500 sm:text-base">
                JobTrack adalah platform pencarian kerja yang membantu jobseeker
                menemukan peluang yang sesuai dan membantu recruiter mengelola
                lowongan serta menemukan kandidat dengan lebih mudah.
              </p>
            </Reveal>
            <Reveal direction="right" delay={230}>
              <p className="mt-4 text-sm leading-relaxed text-neutral-500 sm:text-base">
                Kami membangun JobTrack untuk membuat proses menemukan pekerjaan
                dan mengelola rekrutmen menjadi lebih sederhana, terstruktur, dan
                mudah digunakan.
              </p>
            </Reveal>
            <Reveal direction="right" delay={290}>
              <Link
                href="/home"
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-sky-700 px-7 text-sm font-semibold text-white transition-colors duration-150 hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
              >
                Jelajahi Lowongan
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
                  <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </Reveal>
          </div>
        </section>

        <section
          aria-labelledby="sorot-heading"
          className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24"
        >
          <Reveal direction="left" delay={0}>
            <h2
              id="sorot-heading"
              className="font-display text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl"
            >
              Yang Bisa Kamu Dapatkan
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500 sm:text-base">
              JobTrack menyatukan pencarian lowongan, pengelolaan lamaran, dan
              proses rekrutmen dalam satu alur kerja yang sederhana.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HIGHLIGHTS.map((item, index) => (
              <Reveal key={item.title} direction="right" delay={index * 90}>
                <article className="h-full rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                  >
                    {item.icon}
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-tight text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    {item.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
