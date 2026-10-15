"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard, { AuthField } from "../../components/auth/AuthCard";
import Toast, { ToastData, ToastKind } from "../../components/ui/Toast";
import { API_BASE_URL } from "../../lib/api";
import { resetPasswordSchema } from "../../lib/validation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const notify = (kind: ToastKind, message: string) => {
    setToast({ id: Date.now(), kind, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const lockIcon = (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
      <rect x="3" y="7" width="10" height="6.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );

  const eyeButton = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
      className="shrink-0 rounded text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      {showPassword ? (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
          <path d="M2 8s2-3.5 6-3.5S14 8 14 8s-2 3.5-6 3.5S2 8 2 8Z" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="8" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
          <path d="M2 8s2-3.5 6-3.5c1.5 0 2.8.5 3.8 1.2M14 8s-2 3.5-6 3.5c-1.5 0-2.8-.5-3.8-1.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="m3 3 10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );

  if (!token) {
    return (
      <AuthCard
        title="Tautan tidak valid"
        subtitle="Tautan reset tidak lengkap. Minta tautan baru melalui halaman lupa kata sandi."
        footer={
          <>
            <Link
              href="/forgot-password"
              className="rounded font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Minta tautan baru
            </Link>
          </>
        }
      >
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm leading-relaxed text-red-700"
        >
          Token tidak ditemukan di URL. Pastikan Anda membuka tautan lengkap dari email.
        </div>
      </AuthCard>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || done) return;

    const parsed = resetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      const firstMessage =
        parsed.error.issues[0]?.message ?? "Data tidak valid.";
      notify("error", firstMessage);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success === true) {
        setDone(true);
        notify(
          "success",
          data.message ?? "Kata sandi berhasil diubah. Silakan masuk."
        );
        return;
      }

      if (response.status === 429) {
        notify(
          "error",
          data.message ?? "Terlalu banyak percobaan. Coba lagi nanti."
        );
        return;
      }

      const firstFieldError = Object.values(
        (data as { errors?: Record<string, unknown> }).errors ?? {}
      )
        .flat()
        .find((msg) => typeof msg === "string");

      notify(
        "error",
        (firstFieldError as string | undefined) ??
          (data as { message?: string }).message ??
          "Tautan tidak valid atau sudah kedaluwarsa."
      );
    } catch {
      notify("error", "Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Buat kata sandi baru"
      subtitle="Tautan berlaku 15 menit dan hanya dapat dipakai satu kali."
      footer={
        <>
          Sudah selesai?{" "}
          <Link
            href="/login"
            className="rounded font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Masuk
          </Link>
        </>
      }
    >
      {done ? (
        <div className="space-y-3">
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600"
          >
            Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru Anda.
          </div>
          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950"
          >
            Ke halaman masuk
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-3">
          <AuthField
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder="Kata sandi baru (min. 6 karakter)"
            autoComplete="new-password"
            icon={lockIcon}
            right={eyeButton}
          />
          <AuthField
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Konfirmasi kata sandi baru"
            autoComplete="new-password"
            icon={lockIcon}
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Menyimpan…" : "Simpan kata sandi baru"}
          </button>
        </form>
      )}
      <Toast toast={toast} />
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
