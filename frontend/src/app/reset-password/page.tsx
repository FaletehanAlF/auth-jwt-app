"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthShell, {
  AuthField,
  AuthSubmit,
  PasswordToggle,
} from "../../components/auth/AuthShell";
import Toast, { ToastData, ToastKind } from "../../components/ui/Toast";
import { API_BASE_URL } from "../../lib/api";
import { resetPasswordSchema } from "../../lib/validation";

type FieldErrors = { password?: string; confirmPassword?: string };

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
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

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  if (!token) {
    return (
      <AuthShell
        eyebrow="Tautan bermasalah"
        title="Tautan tidak valid"
        subtitle="Tautan reset tidak lengkap. Minta tautan baru melalui halaman lupa kata sandi."
        heroTitle="Setiap tautan reset hanya berlaku sekali."
        heroDescription="Minta tautan baru bila yang kamu buka sudah kedaluwarsa atau tidak lengkap."
        footer={
          <Link
            href="/forgot-password"
            className="rounded font-semibold text-neutral-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Minta tautan baru
          </Link>
        }
      >
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
        >
          Token tidak ditemukan di URL. Pastikan Anda membuka tautan lengkap dari email.
        </div>
      </AuthShell>
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
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "password" && !next.password) next.password = issue.message;
        if (key === "confirmPassword" && !next.confirmPassword) {
          next.confirmPassword = issue.message;
        }
      }
      setErrors(next);
      return;
    }

    setErrors({});
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
          data.message ?? "Kata sandi berhasil diubah. Silakan masuk.",
        );
        return;
      }

      if (response.status === 429) {
        notify(
          "error",
          data.message ?? "Terlalu banyak percobaan. Coba lagi nanti.",
        );
        return;
      }

      const firstFieldError = Object.values(
        (data as { errors?: Record<string, unknown> }).errors ?? {},
      )
        .flat()
        .find((msg) => typeof msg === "string");

      notify(
        "error",
        (firstFieldError as string | undefined) ??
          (data as { message?: string }).message ??
          "Tautan tidak valid atau sudah kedaluwarsa.",
      );
    } catch {
      notify("error", "Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Keamanan akun"
      title="Buat kata sandi baru"
      subtitle="Tautan berlaku 15 menit dan hanya dapat dipakai satu kali."
      heroTitle="Kata sandi baru, akses yang aman kembali."
      heroDescription="Gunakan kombinasi yang tidak kamu pakai di layanan lain."
      footer={
        <>
          Sudah selesai?{" "}
          <Link
            href="/login"
            className="rounded font-semibold text-neutral-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Masuk
          </Link>
        </>
      }
    >
      {done ? (
        <div className="space-y-4">
          <div
            role="status"
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-600"
          >
            Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru Anda.
          </div>
          <Link
            href="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-neutral-900 text-sm font-semibold text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950"
          >
            Ke halaman masuk
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthField
            id="password"
            label="Kata sandi baru"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(v) => {
              setPassword(v);
              clearFieldError("password");
            }}
            placeholder="Minimal 6 karakter"
            autoComplete="new-password"
            error={errors.password}
            right={
              <PasswordToggle
                shown={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
              />
            }
          />
          <AuthField
            id="confirmPassword"
            label="Konfirmasi kata sandi"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v);
              clearFieldError("confirmPassword");
            }}
            placeholder="Ulangi kata sandi baru"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
          <div className="pt-2">
            <AuthSubmit loading={loading} loadingLabel="Menyimpan…">
              Simpan kata sandi baru
            </AuthSubmit>
          </div>
        </form>
      )}
      <Toast toast={toast} />
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
