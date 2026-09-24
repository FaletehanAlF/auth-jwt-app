import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Halaman Profile belum tersedia. Upload foto profil untuk saat ini
          tetap dapat dilakukan dari halaman Home.
        </p>
        <Link
          href="/home"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
        >
          Kembali ke Home
        </Link>
      </div>
    </main>
  );
}
