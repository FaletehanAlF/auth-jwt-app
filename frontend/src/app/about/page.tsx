import Link from "next/link";
import Image from "next/image";
import SiteMenu from "../../components/SiteMenu";
import Footer from "../../components/Footer";

// ============================================================
// CARA PASANG GAMBAR (nantinya atur sendiri di sini):
// 1. Taruh file gambar di folder: frontend/public/
//    contoh: frontend/public/about-team.jpg
// 2. Isi konstanta di bawah dengan path-nya:
//    MAIN_IMAGE_SRC = "/about-team.jpg"
//    OVERLAY_IMAGE_SRC = "/about-meeting.jpg"
// 3. Biarkan "" (kosong) jika masih ingin tampil placeholder.
// 4. VIDEO_URL opsional: isi link YouTube/video untuk tombol play,
//    contoh: "https://youtube.com/watch?v=xxxx"
// ============================================================
const MAIN_IMAGE_SRC = "";
const OVERLAY_IMAGE_SRC = "";
const VIDEO_URL = "";

const FEATURES = [
  {
    title: "Pelacakan Lamaran",
    desc: "Pantau setiap lamaran kerjamu dalam satu tempat yang rapi.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Analisis Progres",
    desc: "Lihat perkembangan pencarian kerjamu dengan jelas dan terukur.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <path d="M4 19.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6.5 16.5v-5M12 16.5V8M17.5 16.5v-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Siap Wawancara",
    desc: "Kelola jadwal dan catatan wawancara agar selalu siap tampil.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.5 13.5h3M7.5 16.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

function ImagePlaceholder({
  label,
  ratio,
}: {
  label: string;
  ratio: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600/15 text-blue-400">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
          <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.6" />
          <path d="m5.5 17.5 4.5-4.5 3 3 2.5-2.5 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <p className="text-xs font-medium text-white/70">{label}</p>
      <p className="text-[11px] leading-relaxed text-white/40">
        Kosong — isi di konstanta
        <br />
        {ratio}
      </p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip overscroll-none bg-neutral-950 text-white">
      <div className="relative w-full max-w-full overflow-x-clip overscroll-none">
        <SiteMenu />

        <main className="w-full max-w-full overflow-x-clip overscroll-none">
          {/* Layout mengikuti referensi: badge + heading kiri + 2 paragraf kanan */}
          <section className="relative w-full overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0">
              <div className="absolute inset-0 bg-neutral-950" />
              <div className="absolute left-1/2 top-[-9rem] h-80 w-[44rem] -translate-x-1/2 rounded-full bg-blue-700/20 blur-[120px]" />
            </div>

            <div className="relative mx-auto w-full max-w-6xl px-4 pt-28 sm:px-6 sm:pt-36">
              {/* Badge kecil seperti referensi */}
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                About Us
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </p>

              <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr_0.85fr] lg:items-start">
                <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                  <span className="text-blue-500">Introduction</span>{" "}
                  <span className="text-white">To Best Job Tracker!</span>
                </h1>
                <p className="text-sm leading-relaxed text-white/60">
                  JobTrack hadir untuk merapikan perjalanan kariermu. Simpan
                  setiap lamaran, pantau statusnya, dan kelola jadwal
                  wawancaramu — semuanya dalam satu dashboard yang bersih
                  dan mudah dipakai.
                </p>
                <p className="text-sm leading-relaxed text-white/60">
                  Tidak ada lagi catatan tersebar atau peluang terlewat.
                  Dengan JobTrack, kamu bisa fokus pada hal terpenting:
                  tampil terbaik dan terus melangkah maju di setiap proses.
                </p>
              </div>

              {/* 3 kartu fitur seperti referensi */}
              <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                {FEATURES.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-150 hover:border-blue-500/30"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      {item.icon}
                    </span>
                    <span>
                      <h2 className="text-[15px] font-semibold tracking-tight text-white">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/55">
                        {item.desc}
                      </p>
                    </span>
                  </div>
                ))}
              </div>

              {/* Kolase gambar: besar + overlay kecil dengan tombol play */}
              <div className="relative mt-8 pb-10 sm:pb-16 lg:pb-24">
                {/* Gambar utama — KOSONG, atur di MAIN_IMAGE_SRC */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 sm:aspect-[21/10]">
                  {MAIN_IMAGE_SRC ? (
                    <Image
                      src={MAIN_IMAGE_SRC}
                      alt="Tim JobTrack"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 1100px"
                    />
                  ) : (
                    <ImagePlaceholder
                      label="Gambar utama (kolase besar)"
                      ratio="disarankan 1600 × 800"
                    />
                  )}
                </div>

                {/* Gambar overlay kecil + tombol play — KOSONG, atur di OVERLAY_IMAGE_SRC */}
                <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-2 sm:right-6 sm:w-[38%] lg:right-10 lg:w-[34%]">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border-4 border-neutral-950 bg-neutral-900 shadow-2xl shadow-black/50 outline outline-1 outline-white/10">
                    {OVERLAY_IMAGE_SRC ? (
                      <Image
                        src={OVERLAY_IMAGE_SRC}
                        alt="Preview video JobTrack"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 400px"
                      />
                    ) : (
                      <ImagePlaceholder
                        label="Gambar overlay (video)"
                        ratio="disarankan 800 × 500"
                      />
                    )}
                    {/* Tombol play */}
                    {VIDEO_URL ? (
                      <Link
                        href={VIDEO_URL}
                        target="_blank"
                        aria-label="Putar video"
                        className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/50 transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-0.5 h-5 w-5">
                          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                        </svg>
                      </Link>
                    ) : (
                      <span
                        aria-hidden="true"
                        title="Isi VIDEO_URL untuk mengaktifkan"
                        className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600/90 text-white shadow-lg shadow-blue-900/50"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-0.5 h-5 w-5">
                          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
