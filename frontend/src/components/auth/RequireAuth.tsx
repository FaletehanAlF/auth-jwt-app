"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiFetchWithStatus } from "../../lib/api";
import {
  getTokenPayload,
  isPayloadExpired,
  removeStoredAuth,
  type UserRole,
} from "../../lib/auth";

type RequireAuthProps = {
  roles?: UserRole[];
  children: ReactNode;
};

type Status = "checking" | "allowed" | "unreachable" | "server-error";

type ProfileResponse = {
  success: boolean;
  message?: string;
  user?: { id: number; email: string; role: string; avatar_url?: string | null };
};

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
        removeStoredAuth();
        if (!cancelled) router.replace("/login");
        return;
      }

      let res: ProfileResponse;
      let httpStatus: number;
      try {
        const result = await apiFetchWithStatus<ProfileResponse>("/profile");
        res = result.data;
        httpStatus = result.status;
      } catch {
        if (!cancelled) setStatus("unreachable");
        return;
      }
      if (cancelled) return;

      if (httpStatus === 401) {
        removeStoredAuth();
        router.replace("/login");
        return;
      }

      if (httpStatus >= 500) {
        if (!cancelled) setStatus("server-error");
        return;
      }

      if (!res.success || !res.user) {
        if (!cancelled) setStatus("server-error");
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

  if (status === "unreachable" || status === "server-error") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-mist px-4 font-sans">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200/70 bg-white p-8 text-center shadow-sm">
          <p className="font-display text-base font-semibold tracking-tight text-ink-900">
            {status === "unreachable"
              ? "Tidak dapat memeriksa sesi"
              : "Terjadi kesalahan server"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-500">
            {status === "unreachable"
              ? "Server tidak terjangkau. Konten privat disembunyikan sampai pemeriksaan berhasil."
              : "Server mengalami kesalahan. Sesi kamu mungkin masih valid — coba lagi beberapa saat."}
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
