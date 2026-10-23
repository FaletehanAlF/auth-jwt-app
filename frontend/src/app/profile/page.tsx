"use client";

import type { ChangeEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaCamera,
  FaEnvelope,
  FaExclamationTriangle,
  FaIdCard,
  FaSignOutAlt,
  FaTrashAlt,
  FaUserTag,
} from "react-icons/fa";
import AppShell from "../../components/layout/AppShell";
import RequireAuth from "../../components/auth/RequireAuth";
import { apiFetch } from "../../lib/api";
import { getStoredItem, removeStoredAuth, type UserRole } from "../../lib/auth";
import { formatUsername } from "../../lib/username";

/* ------------------------------------------------------------------ *
 * Konfigurasi Cloudinary — dipertahankan persis seperti sebelumnya.
 * Upload unsigned memakai preset publik `jobtrack`; tidak ada API
 * secret yang dikirim ke browser (cloud name + preset memang publik
 * by design untuk unsigned upload). Batas 5 MB, format JPG/PNG/WebP.
 * ------------------------------------------------------------------ */
const CLOUDINARY_CLOUD_NAME = "bsu3p6yn";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type CloudinaryResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

type ProfileResponse = {
  success: boolean;
  message?: string;
  user?: { id: number; email: string; role: string; avatar_url?: string | null };
};

type TabId = "akun" | "keamanan";

const TABS: { id: TabId; label: string }[] = [
  { id: "akun", label: "Informasi Akun" },
  { id: "keamanan", label: "Keamanan" },
];

const ROLE_LABEL: Record<UserRole, string> = {
  recruiter: "Recruiter",
  jobseeker: "Jobseeker",
};

/** Inisial avatar dari email — logika yang sama dipakai UserAvatar. */
function initialFromEmail(email: string | null): string {
  return (email?.trim().charAt(0) || "?").toUpperCase();
}

function readableError(message: string | undefined, fallback: string): string {
  if (message === "Token tidak ditemukan" || message === "Token tidak valid atau sudah expired") {
    return "Sesi kamu sudah berakhir. Silakan masuk kembali.";
  }
  return message ?? fallback;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("akun");

  /* Foto: diambil dari backend (GET /profile) dan disimpan permanen di
     database MySQL via PUT /profile/avatar. */
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  /* Info akun: sumber kebenaran dari backend GET /profile (id, email,
      role, avatar_url sesuai isi JWT). */
  const [account, setAccount] = useState<{ id: number; email: string; role: string; avatar_url?: string | null } | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountAttempt, setAccountAttempt] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelClearRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<ProfileResponse>("/profile");
        if (cancelled) return;
        if (res.success && res.user) {
          setAccountError(null);
          setAccount(res.user);
          setProfileImageUrl(res.user.avatar_url ?? "");
        } else {
          setAccountError(readableError(res.message, "Gagal mengambil informasi akun."));
        }
      } catch {
        if (!cancelled) setAccountError("Gagal menghubungi server. Periksa koneksi lalu coba lagi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountAttempt]);

  useEffect(() => {
    if (!confirmClear) return;
    cancelClearRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setConfirmClear(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmClear]);

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = TABS.findIndex((tab) => tab.id === activeTab);
    const next =
      event.key === "ArrowRight"
        ? TABS[(index + 1) % TABS.length]
        : TABS[(index - 1 + TABS.length) % TABS.length];
    setActiveTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  }

  async function handleProfilePictureUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || isUploading) {
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
        throw new Error(result.error?.message ?? "Upload ke Cloudinary gagal.");
      }

      if (!result.secure_url) {
        throw new Error("Respons Cloudinary tidak memiliki secure_url.");
      }

      await apiFetch("/profile/avatar", {
        method: "PUT",
        body: JSON.stringify({ avatarUrl: result.secure_url }),
      });

      setProfileImageUrl(result.secure_url);
      window.dispatchEvent(new CustomEvent("avatar:updated"));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload gambar gagal.");
    } finally {
      setIsUploading(false);
    }
  }

const email = account?.email ?? null;
const role: UserRole | null = account?.role === "recruiter" ? "recruiter" : account ? "jobseeker" : null;
const storedName = getStoredItem("user_name");

  return (
    <RequireAuth>
      <AppShell title="Profil Saya" subtitle="Kelola informasi akun dan foto profil kamu">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <header>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              Profil Saya
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Kelola informasi akun dan foto profil kamu.
            </p>
          </header>

          {/* ---- Panel pengaturan ---- */}
          <div className="animate-dash-rise overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
              role="tablist"
              aria-label="Pengaturan profil"
              onKeyDown={handleTabKeyDown}
              className="flex gap-1 border-b border-slate-200 px-3 pt-3 sm:px-4"
            >
              {TABS.map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative h-11 shrink-0 rounded-t-xl px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
                      selected ? "text-brand-700" : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    {tab.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-600 transition-opacity ${
                        selected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {activeTab === "akun" && (
              <div id="panel-akun" role="tabpanel" aria-labelledby="tab-akun" className="p-5 sm:p-6">
                {/* ---- Foto profil ---- */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-brand-600 text-2xl font-semibold text-white ring-1 ring-slate-200">
                    {profileImageUrl ? (
                      <Image
                        src={profileImageUrl}
                        alt="Pratinjau foto profil"
                        width={96}
                        height={96}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span aria-hidden="true" className="flex h-full w-full items-center justify-center">
                        {initialFromEmail(email)}
                      </span>
                    )}
                    {isUploading && (
                      <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <span
                          aria-hidden="true"
                          className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
                        />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
{storedName && (
                       <p className="truncate text-sm font-medium text-ink-900">
                         {formatUsername(storedName, role)}
                       </p>
                     )}
                     <p className="truncate text-sm font-medium text-ink-900">
                       {email ?? (account === null && !accountError ? "Memuat…" : "Email tidak tersedia")}
                     </p>
                    {role && (
                      <p className="mt-1.5">
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/15">
                          {ROLE_LABEL[role]}
                        </span>
                      </p>
                    )}
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                      JPG, PNG, atau WebP — maksimal 5 MB.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:w-auto sm:shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProfilePictureUpload}
                      disabled={isUploading}
                      className="hidden"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FaCamera aria-hidden="true" className="h-4 w-4" />
                      {isUploading ? "Mengunggah…" : profileImageUrl ? "Ganti Foto" : "Upload Foto"}
                    </button>
                    {profileImageUrl && !isUploading && (
                      <button
                        type="button"
                        onClick={() => setConfirmClear(true)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                      >
                        <FaTrashAlt aria-hidden="true" className="h-4 w-4" />
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>

                {isUploading && (
                  <p role="status" className="mt-4 flex items-center gap-2 text-sm text-ink-500">
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600"
                    />
                    Mengunggah gambar ke Cloudinary…
                  </p>
                )}

                {uploadError && (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-red-700"
                  >
                    {uploadError}
                  </p>
                )}

                {!uploadError && !isUploading && profileImageUrl && (
                  <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] text-emerald-700">
                    Foto profil berhasil disimpan dan akan tetap muncul di semua sesi login.
                  </p>
                )}

                {/* ---- Form informasi akun ---- */}
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h2 className="font-display text-base font-semibold tracking-tight text-ink-900">
                    Informasi Akun
                  </h2>
                  <p className="mt-1 text-sm text-ink-500">
                    Data akun dari server. Tidak dapat diubah dari halaman ini.
                  </p>

                  {account === null && !accountError && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" role="status" aria-label="Memuat informasi akun">
                      <div className="animate-pulse rounded-xl bg-slate-100 px-4 py-4 sm:col-span-2">
                        <div className="h-4 w-1/4 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
                      </div>
                      {[0, 1].map((i) => (
                        <div key={i} className="animate-pulse rounded-xl bg-slate-100 px-4 py-4">
                          <div className="h-4 w-1/3 rounded bg-slate-200" />
                          <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  )}

                  {accountError && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                      <span
                        aria-hidden="true"
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"
                      >
                        <FaExclamationTriangle className="h-6 w-6" />
                      </span>
                      <p className="mt-4 font-display text-base font-semibold tracking-tight text-ink-900">
                        Gagal memuat informasi akun
                      </p>
                      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">
                        {accountError}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAccount(null);
                          setAccountError(null);
                          setAccountAttempt((n) => n + 1);
                        }}
                        className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  )}

                  {account && (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="akun-email" className="block text-sm font-medium text-ink-900">
                          Email
                        </label>
                        <div className="relative mt-1.5">
                          <FaEnvelope
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
                          />
                          <input
                            id="akun-email"
                            type="email"
                            value={account.email}
                            readOnly
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="akun-role" className="block text-sm font-medium text-ink-900">
                          Role
                        </label>
                        <div className="relative mt-1.5">
                          <FaUserTag
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
                          />
                          <input
                            id="akun-role"
                            type="text"
                            value={ROLE_LABEL[account.role === "recruiter" ? "recruiter" : "jobseeker"]}
                            readOnly
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="akun-id" className="block text-sm font-medium text-ink-900">
                          ID Pengguna
                        </label>
                        <div className="relative mt-1.5">
                          <FaIdCard
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
                          />
                          <input
                            id="akun-id"
                            type="text"
                            value={String(account.id)}
                            readOnly
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "keamanan" && (
              <div id="panel-keamanan" role="tabpanel" aria-labelledby="tab-keamanan" className="p-5 sm:p-6">
                <h2 className="font-display text-base font-semibold tracking-tight text-ink-900">
                  Keamanan
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  Keluar dari akun ini di perangkat yang sedang dipakai.
                </p>
                <Link
                  href="/login"
                  onClick={() => {
                    removeStoredAuth();
                  }}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:w-auto"
                >
                  <FaSignOutAlt aria-hidden="true" className="h-4 w-4" />
                  Keluar
                </Link>
              </div>
            )}
          </div>
        </div>
      </AppShell>

      {confirmClear && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hapus-foto-judul"
          aria-describedby="hapus-foto-deskripsi"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
          onClick={() => setConfirmClear(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2
              id="hapus-foto-judul"
              className="font-display text-base font-semibold tracking-tight text-ink-900"
            >
              Hapus foto?
            </h2>
            <p id="hapus-foto-deskripsi" className="mt-2 text-sm leading-relaxed text-ink-500">
              Pratinjau di halaman ini akan dihapus dan kembali ke inisial email. File yang sudah
              terupload di Cloudinary tidak ikut dihapus.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelClearRef}
                type="button"
                onClick={() => setConfirmClear(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await apiFetch("/profile/avatar", { method: "DELETE" });
                    setProfileImageUrl("");
                    setAccount((prev) => prev ? { ...prev, avatar_url: null } : prev);
                    window.dispatchEvent(new CustomEvent("avatar:updated"));
                  } catch {
                    setUploadError("Gagal menghapus foto profil.");
                  }
                  setConfirmClear(false);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              >
                <FaTrashAlt aria-hidden="true" className="h-4 w-4" />
                Hapus foto
              </button>
            </div>
          </div>
        </div>
      )}
    </RequireAuth>
  );
}
