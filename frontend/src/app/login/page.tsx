"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell, {
  AuthDivider,
  AuthField,
  AuthSubmit,
  GoogleButton,
  PasswordToggle,
} from "../../components/auth/AuthShell";
import Toast, { ToastData, ToastKind } from "../../components/ui/Toast";
import { API_BASE_URL } from "../../lib/api";
import { setStoredAuth } from "../../lib/auth";
import { loginSchema } from "../../lib/validation";

type FieldErrors = { email?: string; password?: string };

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const notify = (kind: ToastKind, message: string) => {
    setToast({ id: Date.now(), kind, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const parsed = loginSchema.safeParse({
      email: email.trim(),
      password,
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "email" && !next.email) next.email = issue.message;
        if (key === "password" && !next.password) next.password = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (data.success === true) {
        setStoredAuth(
          data.token,
          typeof data.user?.name === "string" ? data.user.name : null,
          remember,
        );
        notify("success", "Masuk berhasil! Mengalihkan ke Beranda…");
        setTimeout(() => router.push("/home"), 800);
        return;
      }

      const firstFieldError = Object.values(data.errors ?? {})
        .flat()
        .find((msg) => typeof msg === "string");

      notify(
        "error",
        firstFieldError ?? data.message ?? "Masuk gagal. Periksa kembali data Anda.",
      );
    } catch {
      notify("error", "Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Selamat datang kembali"
      title="Masuk ke JobTrack"
      subtitle="Lanjutkan perjalanan kariermu — semua lamaran, wawancara, dan progres ada di satu tempat."
      heroTitle="Satu tempat untuk seluruh perjalanan kariermu."
      heroDescription="Pantau lamaran, siapkan wawancara, dan lihat perkembangan karier tanpa berpindah-pindah aplikasi."
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="rounded font-semibold text-neutral-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Daftar
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} noValidate className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            clearFieldError("email");
          }}
          placeholder="Masukkan email"
          autoComplete="email"
          error={errors.email}
        />

        <AuthField
          id="password"
          label="Kata sandi"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(v) => {
            setPassword(v);
            clearFieldError("password");
          }}
          placeholder="Masukkan kata sandi"
          autoComplete="current-password"
          error={errors.password}
          right={
            <PasswordToggle
              shown={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="remember"
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
          >
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-300 accent-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            />
            Ingat saya
          </label>

          <Link
            href="/forgot-password"
            className="rounded text-sm font-medium text-neutral-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Lupa kata sandi?
          </Link>
        </div>

        <div className="pt-2">
          <AuthSubmit loading={loading} loadingLabel="Memproses…">
            Masuk
          </AuthSubmit>
        </div>

        <div className="pt-1">
          <AuthDivider />
        </div>

        <GoogleButton label="Masuk dengan Google" />
      </form>
      <Toast toast={toast} />
    </AuthShell>
  );
}
