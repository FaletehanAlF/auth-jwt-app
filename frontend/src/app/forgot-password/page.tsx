"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AuthShell, { AuthField, AuthSubmit } from "../../components/auth/AuthShell";
import Toast, { ToastData, ToastKind } from "../../components/ui/Toast";
import { API_BASE_URL } from "../../lib/api";
import { forgotPasswordSchema } from "../../lib/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
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

    const parsed = forgotPasswordSchema.safeParse({ email: email.trim() });
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message ?? "Format email tidak valid.");
      return;
    }
    setEmailError(undefined);

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
            "Jika email terdaftar, tautan reset telah dikirim. Periksa inbox atau spam.",
        );
        return;
      }

      if (response.status === 429) {
        notify(
          "error",
          data.message ?? "Terlalu banyak permintaan. Coba lagi nanti.",
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
          "Gagal mengirim tautan reset. Coba lagi.",
      );
    } catch {
      notify("error", "Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Pemulihan akun"
      title="Lupa kata sandi?"
      subtitle="Masukkan email akunmu. Kami akan mengirim tautan untuk membuat kata sandi baru."
      heroTitle="Tidak perlu panik — akunmu tetap aman."
      heroDescription="Tautan reset berlaku 15 menit dan hanya bisa dipakai satu kali."
      footer={
        <>
          Ingat kata sandimu?{" "}
          <Link
            href="/login"
            className="rounded font-semibold text-neutral-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Masuk
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <div
            role="status"
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-600"
          >
            Jika email{" "}
            <span className="font-medium text-neutral-900">{email.trim()}</span>{" "}
            terdaftar, tautan reset telah dikirim. Tautan berlaku 15 menit dan hanya
            dapat dipakai satu kali. Periksa folder inbox atau spam.
          </div>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-800 transition-colors duration-150 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Kirim ke email lain
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (emailError) setEmailError(undefined);
            }}
            placeholder="Masukkan email"
            autoComplete="email"
            error={emailError}
          />

          <div className="pt-2">
            <AuthSubmit loading={loading} loadingLabel="Mengirim…">
              Kirim tautan reset
            </AuthSubmit>
          </div>
        </form>
      )}
      <Toast toast={toast} />
    </AuthShell>
  );
}
