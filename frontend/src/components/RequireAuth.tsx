"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";
import {
  getTokenPayload,
  isPayloadExpired,
  type UserRole,
} from "../lib/auth";

type RequireAuthProps = {
  /**
   * Role yang boleh membuka halaman. Kosong/undefined = semua role
   * yang sudah login. Role SALAH -> dialihkan ke /home (dashboard
   * yang memang adaptif per role), bukan ke /login agar tidak loop.
   */
  roles?: UserRole[];
  children: ReactNode;
};

type Status = "checking" | "allowed" | "unreachable";

type ProfileResponse = {
  success: boolean;
  message?: string;
  user?: { id: number; email: string; role: string };
};

/**
 * Gerbang proteksi route privat (client-side).
 *
 * Token disimpan di localStorage sehingga middleware/server tidak bisa
 * membacanya — pemeriksaan dilakukan di sini, SEBELUM children (konten
 * privat) dirender:
 *  1. Token harus ada, ter-decode, dan belum kedaluwarsa (cek lokal cepat).
 *  2. Token divalidasi ke backend GET /profile (sumber kebenaran; role
 *     diambil dari respons server, bukan dari decode lokal yang bisa
 *     dipalsukan). Token rusak/kedaluwarsa dihapus lalu ke /login.
 *  3. Role server di luar `roles` -> ke /home.
 *  4. Backend tak terjangkau -> layar error + tombol ulangi (TANPA
 *     redirect, agar tidak loop dan tidak membocorkan konten privat).
 *
 * Semua navigasi pakai router.replace supaya tombol Back tidak
 * mengembalikan pengguna ke halaman privat yang tak berhak diakses.
 * Keamanan data tetap di backend (verifyToken + authorize).
 */
export default function RequireAuth({ roles, children }: RequireAuthProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [attempt, setAttempt] = useState(0);
  const rolesKey = roles ? roles.join(",") : "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const allowed: UserRole[] | null = rolesKey
        ? (rolesKey.split(",") as UserRole[])
        : null;

      const local = getTokenPayload();
      if (!local || isPayloadExpired(local)) {
        try {
          localStorage.removeItem("token");
        } catch {
          /* abaikan: storage tak tersedia */
        }
        if (!cancelled) router.replace("/login");
        return;
      }

      let res: ProfileResponse;
      try {
        res = await apiFetch<ProfileResponse>("/profile");
      } catch {
        if (!cancelled) setStatus("unreachable");
        return;
      }
      if (cancelled) return;

      if (!res.success || !res.user) {
        try {
          localStorage.removeItem("token");
        } catch {
          /* abaikan: storage tak tersedia */
        }
        router.replace("/login");
        return;
      }

      const serverRole: UserRole =
        res.user.role === "recruiter" ? "recruiter" : "jobseeker";
      if (allowed && !allowed.includes(serverRole)) {
        router.replace("/home");
        return;
      }

      setStatus("allowed");
    })();
    return () => {
      cancelled = true;
    };
  }, [router, rolesKey, attempt]);

  if (status === "allowed") return <>{children}</>;

  if (status === "unreachable") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-mist px-4 font-sans">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white p-8 text-center shadow-sm">
          <p className="font-display text-base font-semibold tracking-tight text-ink-900">
            Tidak dapat memeriksa sesi
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-500">
            Server tidak terjangkau. Konten privat disembunyikan sampai
            pemeriksaan berhasil.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("checking");
              setAttempt((a) => a + 1);
            }}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-ink-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Memeriksa sesi login"
      className="flex min-h-dvh items-center justify-center bg-mist px-4 font-sans"
    >
      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600"
        />
        <p className="text-sm text-ink-500">Memeriksa sesi…</p>
      </div>
    </div>
  );
}
