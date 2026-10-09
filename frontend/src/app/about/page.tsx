import Link from "next/link";
import Image from "next/image";
import SiteMenu from "../../components/SiteMenu";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";
import SplitText from "../../components/SplitText";

const ABOUT_MAIN_IMAGE_SRC = "";
const ABOUT_SECOND_IMAGE_SRC = "";

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
  delay?: string;
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
      <SiteMenu />

      <main className="w-full max-w-full overflow-x-clip">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-4 py-16 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:py-24">
          {/* LEFT — editorial visual composition, muncul dari kiri saat scroll */}
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
                label="Job Match"
                detail="Rekomendasi sesuai skill"
                dotClass="bg-sky-500"
                className="-right-2 top-6"
                delay="220ms"
              />
              <FloatingCard
                label="Profile Ready"
                detail="CV siap digunakan"
                dotClass="bg-lime-400"
                className="-left-2 bottom-14"
                delay="320ms"
              />
              <FloatingCard
                label="New Opportunity"
                detail="Lowongan baru tersedia"
                dotClass="bg-blue-600"
                className="right-6 -top-6 hidden sm:block"
                delay="420ms"
              />
            </div>
          </Reveal>

          {/* RIGHT — about content, muncul dari kanan saat scroll */}
          <div className="w-full max-w-xl">
            <Reveal direction="right" delay={0}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-600">
                A Bit About Us
              </p>
            </Reveal>
            <Reveal direction="right" delay={90}>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl">
                <SplitText
                  text="Connecting Talent With Opportunity"
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
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Explore Jobs
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
                  <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
