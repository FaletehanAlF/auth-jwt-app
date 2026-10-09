import LogoLoop from "./LogoLoop";
import Reveal from "./Reveal";

type Testimonial = {
  name: string;
  role: string;
  initials: string;
  quote: string;
  rating: number;
  accent: string;
};

const ROW_A: Testimonial[] = [
  {
    name: "Alya P.",
    role: "Frontend Developer",
    initials: "AP",
    quote:
      "Baru dua minggu pakai JobTrack, langsung dapat panggilan interview. Detail lowongannya jelas banget.",
    rating: 5,
    accent: "bg-neutral-900",
  },
  {
    name: "Rizky R.",
    role: "UI Designer",
    initials: "RR",
    quote:
      "Proses lamarannya simpel. Progress lamaran bisa dipantau, jadi nggak nebak-nebak lagi.",
    rating: 5,
    accent: "bg-sky-600",
  },
  {
    name: "Sinta M.",
    role: "HR Recruiter",
    initials: "SM",
    quote:
      "Kelola lowongan dan kandidat dalam satu tempat. Jauh lebih rapi dibanding spreadsheet manual.",
    rating: 5,
    accent: "bg-blue-600",
  },
  {
    name: "Dimas A.",
    role: "Backend Developer",
    initials: "DA",
    quote:
      "Filter pencariannya akurat. Lowongan yang muncul sesuai skill dan minat saya.",
    rating: 4,
    accent: "bg-emerald-600",
  },
  {
    name: "Nadia F.",
    role: "Product Manager",
    initials: "NF",
    quote:
      "Tampilan bersih dan cepat. Buka detail pekerjaan sampai kirim lamaran cuma hitungan menit.",
    rating: 5,
    accent: "bg-violet-600",
  },
];

const ROW_B: Testimonial[] = [
  {
    name: "Bagas T.",
    role: "Data Analyst",
    initials: "BT",
    quote:
      "Notifikasi status lamarannya membantu banget. Tahu kapan berkas ditinjau recruiter.",
    rating: 5,
    accent: "bg-amber-600",
  },
  {
    name: "Intan K.",
    role: "Talent Acquisition",
    initials: "IK",
    quote:
      "Sebagai recruiter, saya bisa update info lowongan kapan saja dan kandidat langsung lihat versi terbaru.",
    rating: 5,
    accent: "bg-rose-600",
  },
  {
    name: "Fajar N.",
    role: "Mobile Developer",
    initials: "FN",
    quote:
      "Pengalaman terbaik cari kerja sejauh ini. Nggak ada lowongan abal-abal, semuanya terstruktur.",
    rating: 4,
    accent: "bg-cyan-700",
  },
  {
    name: "Laras W.",
    role: "Fresh Graduate",
    initials: "LW",
    quote:
      "Sebagai lulusan baru, panduan tiap langkahnya jelas. Berani apply karena tahu alurnya.",
    rating: 5,
    accent: "bg-lime-600",
  },
  {
    name: "Yoga S.",
    role: "HRD Manager",
    initials: "YS",
    quote:
      "Shortlist kandidat jadi lebih cepat. Semua lamaran masuk rapi dengan profil yang lengkap.",
    rating: 5,
    accent: "bg-indigo-600",
  },
];

function Stars({ value }: { value: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Rating ${value} dari 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-4 w-4 ${
            i < value ? "fill-amber-400" : "fill-neutral-200"
          }`}
        >
          <path d="M10 1.6 12.4 6.8 18.1 7.3 13.9 11.2 15.1 16.8 10 13.9 4.9 16.8 6.1 11.2 1.9 7.3 7.6 6.8 10 1.6Z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className="testimonial-card w-[280px] shrink-0 rounded-2xl border border-neutral-200/80 bg-white p-5 text-left shadow-[0_20px_50px_-30px_rgba(2,60,120,0.35)] transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_28px_60px_-28px_rgba(2,60,120,0.45)] sm:w-[340px]">
      <Stars value={item.rating} />
      <p className="mt-3 min-h-[3.75rem] text-sm leading-relaxed text-neutral-600">
        &ldquo;{item.quote}&rdquo;
      </p>
      <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-4">
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${item.accent}`}
        >
          {item.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {item.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-neutral-500">{item.role}</p>
        </div>
      </div>
    </article>
  );
}

export default function LandingTestimonials() {
  return (
    <section
      id="testimoni"
      aria-labelledby="testimonials-heading"
      className="relative w-full max-w-full overflow-x-clip bg-white"
    >
      {/* Ambient dekoratif */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-lime-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal direction="up" className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
            <span aria-hidden="true" className="h-px w-8 bg-sky-600/60" />
            Testimoni Pengguna
            <span aria-hidden="true" className="h-px w-8 bg-sky-600/60" />
          </p>
          <h2
            id="testimonials-heading"
            className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-balance text-neutral-900 sm:text-4xl lg:text-5xl"
          >
            Kata mereka tentang <span className="text-blue-600">JobTrack.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-600">
            Cerita jobseeker yang menemukan peluang dan recruiter yang
            merekrut lebih cepat.
          </p>
        </Reveal>

        {/* Loop 1 — ke kiri */}
        <Reveal
          direction="left"
          delay={100}
          className="mt-14 w-full max-w-full sm:mt-16"
        >
          <div className="testimonial-row">
            <LogoLoop
              logos={ROW_A.map((t) => ({
                node: <TestimonialCard item={t} />,
                ariaLabel: `Testimoni ${t.name}`,
              }))}
              speed={45}
              direction="left"
              logoHeight={28}
              gap={20}
              pauseOnHover
              fadeOut
              fadeOutColor="#ffffff"
              ariaLabel="Testimoni pengguna baris pertama, bergerak ke kiri"
              className="testimonial-loop"
            />
          </div>
        </Reveal>

        {/* Loop 2 — ke kanan */}
        <Reveal
          direction="right"
          delay={150}
          className="mt-5 w-full max-w-full"
        >
          <div className="testimonial-row">
            <LogoLoop
              logos={ROW_B.map((t) => ({
                node: <TestimonialCard item={t} />,
                ariaLabel: `Testimoni ${t.name}`,
              }))}
              speed={45}
              direction="right"
              logoHeight={28}
              gap={20}
              pauseOnHover
              fadeOut
              fadeOutColor="#ffffff"
              ariaLabel="Testimoni pengguna baris kedua, bergerak ke kanan"
              className="testimonial-loop"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
