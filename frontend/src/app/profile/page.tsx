"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import AppShell from "../../components/AppShell";
import RequireAuth from "../../components/RequireAuth";
import Reveal from "../../components/Reveal";
import SplitText from "../../components/SplitText";

const CLOUDINARY_CLOUD_NAME = "bsu3p6yn";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type CloudinaryResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

export default function ProfilePage() {
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleProfilePictureUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("File harus berupa gambar JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Ukuran file maksimal 5 MB.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "jobtrack");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const result = (await response.json()) as CloudinaryResponse;

      if (!response.ok) {
        throw new Error(
          result.error?.message ?? "Upload ke Cloudinary gagal.",
        );
      }

      if (!result.secure_url) {
        throw new Error("Respons Cloudinary tidak memiliki secure_url.");
      }

      setProfileImageUrl(result.secure_url);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Upload gambar gagal.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleCopyUrl() {
    if (!profileImageUrl) return;
    try {
      await navigator.clipboard.writeText(profileImageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <RequireAuth>
    <AppShell title="Profil Saya" subtitle="Kelola foto profilmu">
      <div className="rounded-2xl bg-neutral-950 p-6 text-white sm:p-8">
        <div>
            <Reveal direction="left" delay={0}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-teal-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                    Profil Pengguna
                  </p>
                  <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    <SplitText
                      text="Kelola foto profilmu"
                      direction="left"
                      charDelay={12}
                    />
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                    Upload gambar ke Cloudinary. URL hasil upload hanya disimpan
                    di state frontend dan langsung tampil sebagai pratinjau.
                  </p>
                </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5 text-teal-300">
                  <path d="M8 1.5 9.7 5l3.8.3-2.9 2.5.9 3.7L8 9.6 4.5 11.5l.9-3.7L2.5 5.3 6.3 5 8 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                {profileImageUrl ? "Foto terpasang" : "Belum ada foto"}
              </div>
            </div>
            </Reveal>

            <Reveal direction="right" delay={120}>
              <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/80 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="relative h-36 sm:h-44">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-indigo-700 to-teal-600" />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-2 text-xs text-white/80 sm:left-8">
                  <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 backdrop-blur">
                    JobTrack Member
                  </span>
                  <span className="hidden rounded-full border border-white/20 bg-black/30 px-3 py-1 backdrop-blur sm:inline">
                    JPG • PNG • WebP — maks 5 MB
                  </span>
                </div>
              </div>

              <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="-mt-12 flex items-end gap-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-800 text-xl font-semibold text-white ring-4 ring-neutral-900 sm:h-28 sm:w-28">
                      {profileImageUrl ? (
                        <Image
                          src={profileImageUrl}
                          alt="Profile picture"
                          width={112}
                          height={112}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-2xl font-bold tracking-tight">
                          JT
                        </span>
                      )}
                      {isUploading && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        </span>
                      )}
                    </div>
                    <div className="pb-1">
                      <h2 className="font-display text-lg font-semibold text-white">
                        Foto Profil
                      </h2>
                      <p className="mt-0.5 text-[13px] text-white/55">
                        {isUploading
                          ? "Mengunggah gambar…"
                          : profileImageUrl
                            ? "Pratinjau hasil upload Cloudinary"
                            : "Inisial default ditampilkan"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="profile-picture"
                      className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-slate-100 focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-neutral-900 ${isUploading ? "pointer-events-none opacity-60" : ""}`}
                    >
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
                        <path d="M8 10.5V2.5M5 5.5 8 2.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.5 10.5v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {profileImageUrl ? "Ganti foto" : "Upload foto"}
                    </label>
                    {profileImageUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileImageUrl("")}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm font-medium text-white">Upload gambar</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-white/55">
                      Pilih file dari perangkatmu. Validasi tipe & ukuran
                      dilakukan sebelum upload.
                    </p>
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProfilePictureUpload}
                      disabled={isUploading}
                      className="mt-4 block w-full cursor-pointer rounded-xl border border-dashed border-white/20 bg-neutral-950/60 px-3 py-3 text-sm text-white/75 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-white hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {["JPG", "PNG", "WebP"].map((f) => (
                        <span key={f} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/65">
                          {f}
                        </span>
                      ))}
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/65">
                        Maks 5 MB
                      </span>
                    </div>

                    {isUploading && (
                      <p role="status" className="mt-4 flex items-center gap-2 text-sm text-white/70">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-teal-300" />
                        Mengunggah gambar ke Cloudinary…
                      </p>
                    )}

                    {uploadError && (
                      <p role="alert" className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-[13px] leading-relaxed text-red-300">
                        {uploadError}
                      </p>
                    )}

                    {!uploadError && !isUploading && profileImageUrl && (
                      <p className="mt-4 rounded-xl border border-teal-400/25 bg-teal-400/10 px-3.5 py-2.5 text-[13px] text-teal-200">
                        Upload berhasil. Pratinjau di atas sudah memakai URL terbaru.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-sm font-medium text-white">URL hasil upload</p>
                      {profileImageUrl ? (
                        <>
                          <p className="mt-2 break-all rounded-lg bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed text-teal-200/90">
                            {profileImageUrl}
                          </p>
                          <button
                            type="button"
                            onClick={handleCopyUrl}
                            className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 text-[13px] font-medium text-white/85 transition-colors hover:border-white/30 hover:text-white"
                          >
                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                              <rect x="5.5" y="5.5" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="1.4" />
                            </svg>
                            {copied ? "Tersalin!" : "Salin URL"}
                          </button>
                        </>
                      ) : (
                        <p className="mt-2 text-[13px] leading-relaxed text-white/50">
                          Belum ada URL. Upload foto dulu, link Cloudinary akan
                          muncul di sini.
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-5">
                      <p className="text-sm font-medium text-white">Tips foto yang bagus</p>
                      <ul className="mt-2.5 space-y-2 text-[13px] leading-relaxed text-white/60">
                        <li className="flex gap-2">
                          <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-300" />
                          Gunakan foto wajah yang jelas menghadap kamera.
                        </li>
                        <li className="flex gap-2">
                          <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-300" />
                          Pilih background polos agar terlihat profesional.
                        </li>
                        <li className="flex gap-2">
                          <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-300" />
                          Ukuran persegi (1:1) tampil paling rapi.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </Reveal>
          </div>
      </div>
    </AppShell>
    </RequireAuth>
  );
}
