"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    // Reset error sebelumnya sebelum submit
    setErrors({});

    // Validasi frontend dasar: field kosong, jangan fetch
    const clientErrors: {
      name?: string;
      email?: string;
      password?: string;
    } = {};
    if (!name.trim()) clientErrors.name = "Nama wajib diisi";
    if (!email.trim()) clientErrors.email = "Email wajib diisi";
    if (!password) clientErrors.password = "Password wajib diisi";
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/login");
        return;
      }

      // Validasi gagal: jangan redirect, jangan simpan token.
      // Baca response error Zod dari backend.
      const fieldErrors: {
        name?: string;
        email?: string;
        password?: string;
        general?: string;
      } = {};

      if (data.errors) {
        if (Array.isArray(data.errors.name) && data.errors.name.length > 0) {
          fieldErrors.name = data.errors.name[0];
        }
        if (Array.isArray(data.errors.email) && data.errors.email.length > 0) {
          fieldErrors.email = data.errors.email[0];
        }
        if (
          Array.isArray(data.errors.password) &&
          data.errors.password.length > 0
        ) {
          fieldErrors.password = data.errors.password[0];
        }
      }

      if (
        !fieldErrors.name &&
        !fieldErrors.email &&
        !fieldErrors.password &&
        data.message
      ) {
        fieldErrors.general = data.message;
      }

      setErrors(fieldErrors);
    } catch (error) {
      console.error("Gagal menghubungi server:", error);
      setErrors({ general: "Gagal menghubungi server. Coba lagi." });
    }
  };

  const inputBase =
    "h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors duration-150 placeholder:text-slate-400 focus:ring-2";
  const inputIdle = "border-slate-200 focus:border-teal-600 focus:ring-teal-600";
  const inputError = "border-red-400 focus:border-red-500 focus:ring-red-500/15";

  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-linear-to-tr from-teal-800 via-teal-950 to-neutral-950 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="flex max-h-full w-full max-w-4xl flex-col overflow-x-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl shadow-black/30 lg:min-h-[520px] lg:flex-row">
        <aside className="relative z-10 hidden min-w-0 flex-col overflow-hidden rounded-2xl bg-neutral-950 p-8 text-white lg:-mr-6 lg:flex lg:w-[44%]">
          <svg
            viewBox="0 0 400 600"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <path
              d="M-40 90 C 70 130, 120 30, 250 80 S 420 200, 440 140"
              fill="none"
              stroke="#2dd4bf"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />
            <path
              d="M-40 150 C 90 200, 140 90, 270 150 S 430 280, 440 220"
              fill="none"
              stroke="#22d3ee"
              strokeOpacity="0.28"
              strokeWidth="1.5"
            />
            <path
              d="M-40 220 C 110 270, 160 160, 290 220 S 430 360, 440 300"
              fill="none"
              stroke="#60a5fa"
              strokeOpacity="0.22"
              strokeWidth="1.5"
            />
            <path
              d="M-40 330 C 120 380, 180 270, 300 330 S 430 470, 440 410"
              fill="none"
              stroke="#2dd4bf"
              strokeOpacity="0.18"
              strokeWidth="1.5"
            />
            <path
              d="M-40 450 C 130 500, 200 390, 310 450 S 430 580, 440 520"
              fill="none"
              stroke="#22d3ee"
              strokeOpacity="0.14"
              strokeWidth="1.5"
            />
            <path
              d="M-40 540 C 140 590, 220 480, 330 540"
              fill="none"
              stroke="#60a5fa"
              strokeOpacity="0.12"
              strokeWidth="1.5"
            />
          </svg>

          <div className="relative flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-400/15">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <rect
                  x="3"
                  y="7.5"
                  width="18"
                  height="12.5"
                  rx="2.5"
                  stroke="#5eead4"
                  strokeWidth="1.8"
                />
                <path
                  d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"
                  stroke="#5eead4"
                  strokeWidth="1.8"
                />
                <path
                  d="M3 12.5h18"
                  stroke="#5eead4"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-semibold tracking-tight">
                JobTrack
              </span>
              <span className="mt-0.5 block text-xs text-white/70">
                Career &amp; Job Application Tracker
              </span>
            </span>
          </div>

          <div className="relative mt-auto pt-10">
            <p className="font-display text-2xl font-semibold leading-tight tracking-tight xl:text-3xl">
              Start tracking your career
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-white/80">
              Applications, interviews, and progress in one place.
            </p>
          </div>

          <div aria-hidden="true" className="relative mt-8">
            <div className="flex items-center">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal-400" />
              <span className="h-px flex-1 bg-white/20" />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/40" />
              <span className="h-px flex-1 bg-white/20" />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/40" />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-medium">
              <span className="text-white">Applied</span>
              <span className="text-white/60">Interview</span>
              <span className="text-white/60">Offer</span>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col justify-center rounded-2xl bg-white px-6 py-8 sm:px-8 lg:py-8 lg:pl-12 lg:pr-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <rect
                    x="3"
                    y="7.5"
                    width="18"
                    height="12.5"
                    rx="2.5"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <path d="M3 12.5h18" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </span>
              <span className="font-display text-base font-semibold tracking-tight">
                JobTrack
              </span>
            </div>

            <h1 className="text-center font-display text-xl font-semibold tracking-tight sm:text-2xl">
              Create your JobTrack account
            </h1>
            <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-relaxed text-slate-600">
              Organize your applications, interviews, and career progress in one place.
            </p>

            <form onSubmit={handleRegister} noValidate className="mt-6 space-y-4">
              {errors.general && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-snug text-red-700"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  >
                    <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M10 6.5v4.2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="10" cy="13.4" r="1" fill="currentColor" />
                  </svg>
                  <span>{errors.general}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "register-name-error" : undefined}
                  className={`${inputBase} ${errors.name ? inputError : inputIdle}`}
                  placeholder="Your full name"
                  autoComplete="name"
                />
                {errors.name && (
                  <p id="register-name-error" className="mt-1.5 text-sm leading-snug text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "register-email-error" : undefined}
                  className={`${inputBase} ${errors.email ? inputError : inputIdle}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p id="register-email-error" className="mt-1.5 text-sm leading-snug text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "register-password-error" : undefined}
                  className={`${inputBase} ${errors.password ? inputError : inputIdle}`}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p id="register-password-error" className="mt-1.5 text-sm leading-snug text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:bg-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>Create account</span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    d="M2.5 8h10.5M9.5 4.5 13 8l-3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="rounded font-medium text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
