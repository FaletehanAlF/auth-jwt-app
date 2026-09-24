"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard, { AuthField } from "../../components/AuthCard";
import Toast, { ToastData, ToastKind } from "../../components/Toast";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const notify = (kind: ToastKind, message: string) => {
    setToast({ id: Date.now(), kind, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    // Validasi kosong: notifikasi hanya lewat toast.
    if (!name.trim()) {
      notify("error", "Nama wajib diisi");
      return;
    }
    if (!email.trim()) {
      notify("error", "Email wajib diisi");
      return;
    }
    if (!password) {
      notify("error", "Password wajib diisi");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        notify("success", "Registrasi berhasil! Silakan masuk.");
        setTimeout(() => router.push("/login"), 800);
        return;
      }

      const firstFieldError =
        (Array.isArray(data.errors?.name) && data.errors.name[0]) ||
        (Array.isArray(data.errors?.email) && data.errors.email[0]) ||
        (Array.isArray(data.errors?.password) && data.errors.password[0]) ||
        null;

      notify(
        "error",
        firstFieldError ?? data.message ?? "Registrasi gagal. Periksa kembali data Anda.",
      );
    } catch (error) {
      console.error("Gagal menghubungi server:", error);
      notify("error", "Gagal menghubungi server. Coba lagi.");
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Organize your applications, interviews, and career progress in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="rounded font-medium text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister} noValidate className="space-y-3">
        <AuthField
          id="name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Name"
          autoComplete="name"
          icon={
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
              <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3 13.5c.8-2.3 2.7-3.5 5-3.5s4.2 1.2 5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          }
        />

        <AuthField
          id="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email"
          autoComplete="email"
          icon={
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
              <rect x="2" y="3.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="m3 5 5 3.5L13 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />

        <AuthField
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Password"
          autoComplete="new-password"
          icon={
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
              <rect x="3" y="7" width="10" height="6.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          }
          right={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="shrink-0 rounded text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
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
          }
        />

        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950"
        >
          Create account
        </button>
      </form>
      <Toast toast={toast} />
    </AuthCard>
  );
}
