"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AuthCard, { AuthField } from "../../components/auth/AuthCard";
import Toast, { ToastData, ToastKind } from "../../components/ui/Toast";
import { API_BASE_URL } from "../../lib/api";
import { forgotPasswordSchema } from "../../lib/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const notify = (kind: ToastKind, message: string) => {
    setToast({ id: Date.now(), kind, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      notify("error", "Email wajib diisi");
      return;
    }

    const parsed = forgotPasswordSchema.safeParse({ email: email.trim() });
    if (!parsed.success) {
      const firstMessage =
        parsed.error.issues[0]?.message ?? "Format email tidak valid.";
      notify("error", firstMessage);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success === true) {
        setSent(true);
        notify(
          "success",
          data.message ??
            "Jika email terdaftar, tautan reset telah dikirim. Periksa inbox atau spam."
        );
        return;
      }

      if (response.status === 429) {
        notify(
          "error",
          data.message ?? "Terlalu banyak permintaan. Coba lagi nanti."
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
          "Gagal mengirim tautan reset. Coba lagi."
      );
    } catch {
      notify("error", "Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Lupa kata sandi"
      subtitle="Masukkan email akunmu. Kami akan mengirim tautan untuk membuat kata sandi baru."
      footer={
        <>
          Ingat kata sandimu?{" "}
          <Link
            href="/login"
            className="rounded font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Masuk
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-3">
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600"
          >
            Jika email <span className="font-medium text-slate-900">{email.trim()}</span>{" "}
            terdaftar, tautan reset telah dikirim. Tautan berlaku 15 menit dan hanya
            dapat dipakai satu kali. Periksa folder inbox atau spam.
          </div>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Kirim ke email lain
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-3">
          <AuthField
            id="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Email"
            autoComplete="off"
            icon={
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4">
                <rect x="2" y="3.5" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="m3 5 5 3.5L13 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-neutral-900 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Mengirim…" : "Kirim tautan reset"}
          </button>
        </form>
      )}
      <Toast toast={toast} />
    </AuthCard>
  );
}
