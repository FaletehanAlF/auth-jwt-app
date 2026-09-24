"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShapeGrid from "../../components/ShapeGrid";
import Toast, { ToastData, ToastKind } from "../../components/Toast";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);

  const notify = (kind: ToastKind, message: string) => {
    setToast({ id: Date.now(), kind, message });
  };

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    // Validasi frontend dasar: field kosong, jangan fetch.
    // Notifikasi hanya lewat toast agar layout input tidak bergeser.
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
        notify("success", "Registrasi berhasil! Silakan masuk.");
        setTimeout(() => router.push("/login"), 800);
        return;
      }

      // Validasi gagal: jangan redirect, jangan simpan token.
      // Baca response error Zod dari backend, tampilkan via toast saja.
      const firstFieldError =
        (Array.isArray(data.errors?.name) && data.errors.name[0]) ||
        (Array.isArray(data.errors?.email) && data.errors.email[0]) ||
        (Array.isArray(data.errors?.password) && data.errors.password[0]) ||
        null;

      notify(
        "error",
        firstFieldError ??
          data.message ??
          "Registrasi gagal. Periksa kembali data Anda.",
      );
    } catch (error) {
      console.error("Gagal menghubungi server:", error);
      notify("error", "Gagal menghubungi server. Coba lagi.");
    }
  };

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-colors duration-150 placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600";

  return (
    <main className="relative flex h-dvh items-center justify-center overflow-hidden overscroll-none bg-linear-to-tr from-teal-800 via-teal-950 to-neutral-950 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div aria-hidden="true" className="absolute inset-0">
        <ShapeGrid
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="rgba(94, 234, 212, 0.22)"
          hoverFillColor="rgba(45, 212, 191, 0.35)"
          shape="square"
          hoverTrailAmount={5}
        />
      </div>
      <div className="relative flex max-h-full w-full max-w-4xl flex-col overflow-x-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl shadow-black/30 lg:min-h-[min(520px,100%)] lg:flex-row">
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

        <div className="flex min-w-0 flex-1 flex-col justify-center rounded-2xl bg-white px-6 py-6 sm:px-8 lg:py-8 lg:pl-12 lg:pr-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-5 flex items-center justify-center gap-2 lg:mb-6 lg:hidden">
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

            <form onSubmit={handleRegister} noValidate className="mt-5 space-y-4 lg:mt-6">
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
                  className={inputClass}
                  placeholder="Your full name"
                  autoComplete="name"
                />
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
                  className={inputClass}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
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
                  className={inputClass}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
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

            <p className="mt-4 text-center text-sm text-slate-600 lg:mt-5">
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
      <Toast toast={toast} />
    </main>
  );
}
