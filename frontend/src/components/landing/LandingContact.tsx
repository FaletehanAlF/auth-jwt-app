"use client";

import { FormEvent, useState } from "react";
import { FaArrowRight, FaEnvelope } from "react-icons/fa";
import Reveal from "../ui/Reveal";

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

/**
 * PLACEHOLDER — belum ada alamat email resmi JobTrack di repo ini (tidak di
 * env, README, maupun konstanta backend). Ganti satu baris ini begitu alamat
 * resmi tersedia; seluruh UI mengambil nilainya dari sini.
 */
const CONTACT_EMAIL = "halo@jobtrack.id";

/**
 * Endpoint Formspree yang SUDAH dipakai form ini sebelum perubahan desain.
 * Bukan endpoint backend JobTrack: `backend/routes.ts` tidak punya route
 * kontak sama sekali. Jangan diganti tanpa persetujuan.
 */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mdeapaqv";

/**
 * Jalur masuk yang benar-benar ada di aplikasi. Hanya email yang ditampilkan:
 * lokasi dan nomor telepon tidak pernah didefinisikan di proyek, jadi
 * keduanya sengaja tidak dikarang.
 */
const CONTACT_CHANNELS = [
  {
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    icon: FaEnvelope,
  },
];

const FIELD_CLASS =
  "mt-2 h-12 w-full rounded-xl border bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0";

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
      // Status sukses hanya dipasang setelah server membalas 2xx — tidak ada
      // pesan sukses palsu saat pengiriman gagal.
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

  const inputClass = (field: keyof FormState) =>
    `${FIELD_CLASS} ${
      errors[field]
        ? "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-200"
        : "border-neutral-200 focus-visible:border-sky-600 focus-visible:ring-sky-200"
    }`;

  return (
    <section
      id="hubungi-kami"
      aria-labelledby="hubungi-kami-heading"
      className="relative w-full max-w-full scroll-mt-24 overflow-x-clip bg-neutral-50"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-lime-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div className="rounded-[1.75rem] border border-neutral-200/80 bg-white p-6 shadow-[0_32px_70px_-40px_rgba(2,60,120,0.4)] sm:rounded-[2rem] sm:p-10 lg:p-12">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            {/* Kolom kiri — masuk dari kiri (padanan AOS fade-right) */}
            <div className="min-w-0">
              <Reveal direction="left" delay={0} distance={40} repeat>
                <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
                  <span aria-hidden="true" className="h-px w-8 bg-sky-600/60" />
                  Hubungi Kami
                </p>
              </Reveal>

              {/* Ukuran display diturunkan di lg karena layout dua kolom
                  menyempitkan kolom teks (~490-540px): "Hubungi Tim JobTrack"
                  tidak muat utuh pada 48px, sama seperti judul di
                  LandingAbout.tsx:102. */}
              <Reveal direction="left" delay={90} distance={40} repeat>
                <h2
                  id="hubungi-kami-heading"
                  className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-balance text-neutral-900 sm:text-4xl lg:text-[2.5rem]"
                >
                  Hubungi Tim <span className="text-blue-600">JobTrack</span>
                </h2>
              </Reveal>

              <Reveal direction="left" delay={170} distance={40} repeat>
                <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-600">
                  Punya pertanyaan, kendala, atau membutuhkan bantuan? Tim kami
                  siap membantu kamu menemukan solusi dan mendapatkan
                  pengalaman terbaik menggunakan JobTrack.
                </p>
              </Reveal>

              <Reveal direction="left" delay={250} distance={40} repeat>
                <ul className="mt-8 space-y-3">
                  {CONTACT_CHANNELS.map((channel) => {
                    const Icon = channel.icon;
                    return (
                      <li key={channel.label}>
                        <a
                          href={channel.href}
                          className="group flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white px-4 py-3.5 transition-colors duration-150 hover:border-sky-200 hover:bg-sky-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
                            <Icon aria-hidden="true" className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                              {channel.label}
                            </span>
                            <span className="mt-1 block truncate text-sm font-medium text-neutral-900">
                              {channel.value}
                            </span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            </div>

            {/* Kolom kanan — masuk dari kanan (padanan AOS fade-left) */}
            <Reveal direction="right" delay={120} distance={40} repeat>
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5 sm:p-7">
                <h3 className="font-display text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                  Kirim Pesan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  Isi formulir di bawah, kami balas lewat email kamu.
                </p>

                <div aria-live="polite" aria-atomic="true">
                  {status === "success" && (
                    <p
                      role="status"
                      className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                    >
                      Pesan berhasil dikirim. Terima kasih telah menghubungi
                      JobTrack.
                    </p>
                  )}

                  {status === "error" && submitError && (
                    <p
                      role="alert"
                      className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {submitError}
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-medium text-neutral-800"
                    >
                      Nama lengkap
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) => handleChange("name", event.target.value)}
                      placeholder="Masukkan nama lengkap"
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      className={inputClass("name")}
                    />
                    {errors.name && (
                      <p id="contact-name-error" className="mt-1.5 text-xs text-red-600">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-medium text-neutral-800"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      placeholder="Masukkan alamat email"
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      className={inputClass("email")}
                    />
                    {errors.email && (
                      <p id="contact-email-error" className="mt-1.5 text-xs text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-sm font-medium text-neutral-800"
                    >
                      Subjek
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      autoComplete="off"
                      value={form.subject}
                      onChange={(event) => handleChange("subject", event.target.value)}
                      placeholder="Apa yang ingin kamu tanyakan?"
                      aria-invalid={errors.subject ? true : undefined}
                      aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                      className={inputClass("subject")}
                    />
                    {errors.subject && (
                      <p id="contact-subject-error" className="mt-1.5 text-xs text-red-600">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-neutral-800"
                    >
                      Pesan
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={(event) => handleChange("message", event.target.value)}
                      placeholder="Ceritakan pertanyaan atau kendala yang kamu alami"
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={errors.message ? "contact-message-error" : undefined}
                      className={`mt-2 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
                        errors.message
                          ? "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-200"
                          : "border-neutral-200 focus-visible:border-sky-600 focus-visible:ring-sky-200"
                      }`}
                    />
                    {errors.message && (
                      <p id="contact-message-error" className="mt-1.5 text-xs text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="group inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950 disabled:cursor-not-allowed disabled:opacity-70"
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
                      <>
                        Kirim Pesan
                        <FaArrowRight
                          aria-hidden="true"
                          className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
