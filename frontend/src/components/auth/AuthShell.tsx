"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

/**
 * Bentuk lengkung di tepi kanan panel foto, mengikuti referensi: panel putih
 * "memakan" sisi kanan gambar dengan kurva-S. Dibuat sebagai SVG putih yang
 * menimpa tepi kanan (bukan border-radius, yang tidak bisa membentuk kurva
 * ganda seperti ini, dan bukan clip-path, yang sulit disetel).
 *
 * `preserveAspectRatio="none"` membuat kurva ikut meregang setinggi panel,
 * jadi tidak ada celah di resolusi layar mana pun.
 */
function WaveEdge() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 800"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-y-0 right-0 z-20 h-full w-16 text-white sm:w-24"
    >
      <path
        fill="currentColor"
        d="M100 0 C 58 96 34 180 56 276 C 78 372 90 452 62 548 C 38 640 34 720 100 800 L 100 0 Z"
      />
    </svg>
  );
}

export type AuthShellProps = {
  /** Judul besar di panel foto, mis. "Masuk ke JobTrack". */
  heroTitle: ReactNode;
  /** Paragraf pendukung di bawah judul panel foto. */
  heroDescription: string;
  /** Gambar panel kiri. Ganti dengan aset JobTrack milikmu kapan saja. */
  imageSrc?: string;
  imageAlt?: string;
  /** Kredit fotografer — wajib selama memakai gambar placeholder berlisensi. */
  imageCredit?: string;
  /** Kicker kecil di atas judul form. */
  eyebrow: string;
  /** Judul utama form, mis. "Welcome Back". */
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthShell({
  heroTitle,
  heroDescription,
  imageSrc = "/assets/auth-side.jpg",
  imageAlt = "Tim sedang berkolaborasi di kantor modern",
  imageCredit = "Foto: Yan Krukau / Pexels",
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-dvh w-full flex-col overflow-x-clip bg-neutral-50 px-3 py-6 text-neutral-900 sm:px-5 sm:py-8 lg:px-8">
      <div className="animate-auth-card mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-neutral-200/70 bg-white shadow-[0_40px_90px_-50px_rgba(2,60,120,0.45)] sm:rounded-[2rem] lg:flex-row">
        {/* ---------------- Panel kiri (foto) ---------------- */}
        <aside className="relative isolate hidden min-h-[560px] overflow-hidden bg-neutral-900 lg:flex lg:w-[46%] lg:shrink-0">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="object-cover"
          />
          {/* Lapisan gelap: menjaga judul tetap terbaca di atas foto apa pun
              yang kamu pasang nanti. Cukup pekat di tepi atas/bawah, tipis di
              tengah supaya foto tidak terlihat pudar. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-neutral-950/65 via-neutral-950/20 to-neutral-950/70"
          />

          <div className="relative z-10 flex w-full flex-col justify-center p-8 sm:p-10">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
              <span aria-hidden="true" className="h-px w-8 bg-white/40" />
              JobTrack
            </p>
            <p className="mt-5 font-display text-2xl font-semibold leading-[1.2] tracking-tight text-balance text-white sm:text-[1.75rem]">
              {heroTitle}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {heroDescription}
            </p>
          </div>

          {/* Kredit lisensi: syarat pemakaian foto placeholder. Hapus baris
              ini kalau kamu sudah mengganti dengan aset milik sendiri. */}
          <p className="absolute inset-x-0 bottom-5 z-10 px-8 text-[11px] text-white/45 sm:px-10">
            {imageCredit}
          </p>

          {/* Tepi kanan membentuk lengkung; panel putih menimpanya. */}
          <WaveEdge />
        </aside>

        {/* ---------------- Panel kanan (form) ---------------- */}
        <div className="relative flex w-full flex-1 flex-col">
          {/* Logo kecil + tautan silang, menggantikan hamburger di referensi. */}
          <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full text-sm font-semibold tracking-tight text-neutral-900 transition-opacity duration-150 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            >
              <Image
                src="/assets/jobtrack.avif"
                alt=""
                width={28}
                height={28}
                aria-hidden="true"
                className="h-7 w-7 object-contain"
              />
              <span className="font-display">JobTrack</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 sm:py-10">
            <div className="w-full max-w-[24rem]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-balance text-neutral-900 sm:text-[2.5rem]">
                {title}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-600">
                {subtitle}
              </p>

              <div className="mt-7">{children}</div>

              <div className="mt-6 text-sm text-neutral-600">{footer}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Field dengan gaya referensi: kotak bergaris tipis, label di atas, ikon
 * mata opsional di dalam input. Error ditampilkan di bawah field dan
 * dihubungkan lewat aria-describedby.
 */
export function AuthField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  right,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  error?: string;
  right?: ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <div
        className={`mt-1.5 flex h-11 items-center gap-2 rounded-lg border bg-white px-3 transition-colors duration-150 focus-within:ring-2 ${
          error
            ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-200"
            : "border-neutral-300 focus-within:border-neutral-900 focus-within:ring-neutral-900/15"
        }`}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />
        {right}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Tombol mata untuk field kata sandi. Dipakai di login, register, reset. */
export function PasswordToggle({
  shown,
  onToggle,
}: {
  shown: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
      className="shrink-0 rounded p-1 text-neutral-400 transition-colors duration-150 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
    >
      {shown ? (
        <FaEyeSlash aria-hidden="true" className="h-4 w-4" />
      ) : (
        <FaEye aria-hidden="true" className="h-4 w-4" />
      )}
    </button>
  );
}

/** Tombol utama: gelap, penuh lebar, dengan spinner saat proses berjalan. */
export function AuthSubmit({
  loading,
  loadingLabel,
  children,
}: {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-sm font-semibold text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Pemisah "atau" bergaris, seperti pada referensi. */
export function AuthDivider({ label = "Atau" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-neutral-200" />
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </span>
      <span className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

/**
 * Google belum didukung backend JobTrack (tidak ada OAuth sama sekali).
 * Tombol sengaja disabled dan berlabel "segera hadir" — jangan diaktifkan
 * tanpa menambahkan alur OAuth yang benar di backend.
 */
export function GoogleButton({ label }: { label: string }) {
  return (
    <div>
      <button
        type="button"
        disabled
        aria-describedby="google-unavailable"
        className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-400"
      >
        <GoogleGlyph />
        {label}
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Segera
        </span>
      </button>
      <p id="google-unavailable" className="sr-only">
        Masuk dengan Google belum tersedia di JobTrack.
      </p>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4 opacity-50">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
