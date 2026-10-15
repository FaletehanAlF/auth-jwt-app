"use client";

import { FormEvent, useState } from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mdeapaqv";

export default function LandingContact() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Nama wajib diisi.";
    if (!form.email.trim()) nextErrors.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Format email tidak valid.";
    }
    if (!form.subject.trim()) nextErrors.subject = "Subjek wajib diisi.";
    if (!form.message.trim()) nextErrors.message = "Pesan wajib diisi.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status === "success" || status === "error") {
      setStatus("idle");
      setSubmitError("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    if (status === "loading") return;
    if (!validate()) return;

    setStatus("loading");
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { errors?: { message?: string }[]; message?: string }
          | null;
        const message =
          data?.errors?.[0]?.message ??
          data?.message ??
          "Pesan gagal dikirim. Coba lagi.";
        throw new Error(message);
      }

      await response.json().catch(() => null);
      setStatus("success");
      setForm(INITIAL_FORM);
      setErrors({});
    } catch (error) {
      setStatus("error");
      setSubmitError(
        error instanceof Error ? error.message : "Tidak dapat mengirim pesan. Periksa koneksi lalu coba lagi.",
      );
    }
  };

  return (
    <section
      id="hubungi-kami"
      aria-labelledby="hubungi-kami-heading"
      className="relative w-full max-w-full overflow-x-clip bg-white"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
            Hubungi Kami
          </p>
          <h2
            id="hubungi-kami-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl"
          >
            Kirim pesan kepada tim JobTrack
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Punya pertanyaan, saran, atau kendala? Isi formulir berikut dan kami akan merespons secepatnya.
          </p>
        </div>

        {status === "success" && (
          <p
            role="status"
            className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700"
          >
            Pesan berhasil dikirim. Terima kasih telah menghubungi JobTrack.
          </p>
        )}

        {status === "error" && submitError && (
          <p
            role="alert"
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            {submitError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-neutral-800">
                Nama
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="Nama lengkap"
                className="mt-1.5 h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:border-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-neutral-800">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="nama@email.com"
                className="mt-1.5 h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:border-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="contact-subject" className="block text-sm font-medium text-neutral-800">
              Subjek
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={(event) => handleChange("subject", event.target.value)}
              placeholder="Subjek pesan"
              className="mt-1.5 h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:border-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            />
            {errors.subject && (
              <p className="mt-1.5 text-xs text-red-600">{errors.subject}</p>
            )}
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-neutral-800">
              Pesan
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={form.message}
              onChange={(event) => handleChange("message", event.target.value)}
              placeholder="Tulis pesan Anda di sini"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:border-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            />
            {errors.message && (
              <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-6 text-sm font-medium text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
                Mengirim pesan...
              </>
            ) : (
              "Kirim Pesan"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}