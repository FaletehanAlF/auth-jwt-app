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
import { registerSchema } from "../../lib/validation";

type FieldErrors = { name?: string; email?: string; password?: string };

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const parsed = registerSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" && !next.name) next.name = issue.message;
        if (key === "email" && !next.email) next.email = issue.message;
        if (key === "password" && !next.password) next.password = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await response.json();

      if (data.success) {
        notify("success", "Registrasi berhasil! Silakan masuk.");
        setTimeout(() => router.push("/login"), 800);
        return;
      }

      const firstFieldError = Object.values(data.errors ?? {})
        .flat()
        .find((msg) => typeof msg === "string");

      notify(
        "error",
        firstFieldError ?? data.message ?? "Registrasi gagal. Periksa kembali data Anda.",
      );
    } catch {
      notify("error", "Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Mulai sekarang"
      title="Buat akun JobTrack"
      subtitle="Atur lamaran, wawancara, dan progres kariermu dalam satu tempat yang rapi."
      heroTitle="Bangun karier yang lebih terarah, mulai hari ini."
      heroDescription="Buat akun gratis, lalu kelola setiap lamaran dan wawancara dengan rapi."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="rounded font-semibold text-neutral-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister} noValidate className="space-y-4">
        <AuthField
          id="name"
          label="Nama lengkap"
          type="text"
          value={name}
          onChange={(v) => {
            setName(v);
            clearFieldError("name");
          }}
          placeholder="Masukkan nama lengkap"
          autoComplete="name"
          error={errors.name}
        />

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

        <div className="pt-2">
          <AuthSubmit loading={loading} loadingLabel="Membuat akun…">
            Buat akun
          </AuthSubmit>
        </div>

        <div className="pt-1">
          <AuthDivider />
        </div>

        <GoogleButton label="Daftar dengan Google" />
      </form>
      <Toast toast={toast} />
    </AuthShell>
  );
}
