"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import RequireAuth from "../../components/RequireAuth";
import { apiFetch } from "../../lib/api";
import {
  getEmailFromToken,
  getRoleFromToken,
  type UserRole,
} from "../../lib/auth";
import type { Applicant, Application, Job } from "../../lib/types";

const TOKEN_MESSAGES = [
  "Token tidak ditemukan",
  "Token tidak valid atau sudah expired",
  "Belum terautentikasi",
];

function isTokenMessage(message?: string): boolean {
  return !!message && TOKEN_MESSAGES.includes(message);
}

function greetingForHour(hour: number): string {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

/** Nama tampilan dari prefix email ("budi.santoso@x" -> "Budi Santoso"). */
function nameFromEmail(email: string | null): string {
  if (!email) return "";
  const prefix = email.split("@")[0] ?? "";
  const words = prefix
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return words.join(" ").slice(0, 32);
}

function formatDateId(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isWithinDays(iso: string | undefined, days: number): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  const diff = Date.now() - t;
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function StatIcon({ kind }: { kind: string }) {
  const cls = "h-5 w-5";
  if (kind === "search") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 19.5c1.2-3 3.2-4.5 5.5-4.5s4.3 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="16.5" cy="9.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 15.2c2 .3 3.6 1.6 4.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "building") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
        <rect x="4.5" y="3.5" width="15" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 7.5h2M13 7.5h2M9 11h2M13 11h2M9 14.5h2M13 14.5h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10.5 20.5v-3h3v3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "clock") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "briefcase") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
        <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
      <path d="M6 3.5h8L19 8.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3.5V8.5H19" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 13h7M8.5 16.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StatCard({
  icon,
  tint,
  value,
  label,
  href,
  linkLabel,
  delay,
}: {
  icon: string;
  tint: string;
  value: string;
  label: string;
  href: string;
  linkLabel: string;
  delay: number;
}) {
  return (
    <div
      className="animate-dash-rise rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        aria-hidden="true"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}
      >
        <StatIcon kind={icon} />
      </span>
      <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink-900">
        {value}
      </p>
      <p className="mt-1 text-sm text-ink-500">{label}</p>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
      >
        {linkLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" role="status" aria-label="Memuat ringkasan">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
        >
          <div className="h-10 w-10 rounded-xl bg-slate-100" />
          <div className="mt-4 h-8 w-20 rounded-lg bg-slate-100" />
          <div className="mt-2 h-4 w-32 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat daftar">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-slate-200/70 bg-white px-4 py-4"
        >
          <div className="h-4 w-2/3 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  message,
  needsLogin,
  onRetry,
}: {
  message: string;
  needsLogin: boolean;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="animate-dash-rise rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <p className="text-sm font-medium text-red-700">{message}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {needsLogin ? (
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-ink-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
          >
            Masuk ke Akun
          </Link>
        ) : (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-ink-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  href,
  actionLabel,
  delay = 0,
}: {
  title: string;
  desc: string;
  href: string;
  actionLabel: string;
  delay?: number;
}) {
  return (
    <div
      className="animate-dash-rise rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="font-display text-base font-semibold text-ink-900">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">{desc}</p>
      <Link
        href={href}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function JobseekerDashboard({ email }: { email: string | null }) {
  const [apps, setApps] = useState<Application[] | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [appsRes, jobsRes] = await Promise.all([
          apiFetch<{ success: boolean; message?: string; applications?: Application[] }>(
            "/applications/me",
          ),
          apiFetch<{ success: boolean; message?: string; jobs?: Job[] }>("/jobs"),
        ]);
        if (cancelled) return;
        const failMessage =
          !(appsRes.success && Array.isArray(appsRes.applications))
            ? (appsRes.message ?? "Gagal mengambil lamaran.")
            : !(jobsRes.success && Array.isArray(jobsRes.jobs))
              ? (jobsRes.message ?? "Gagal mengambil lowongan.")
              : null;
        if (failMessage) {
          if (isTokenMessage(failMessage)) {
            setNeedsLogin(true);
            setError("Sesi berakhir atau kamu belum masuk. Masuk untuk melihat dashboard.");
          } else {
            setError(failMessage);
          }
          return;
        }
        setApps(appsRes.applications ?? []);
        setJobs(jobsRes.jobs ?? []);
      } catch {
        if (!cancelled) setError("Gagal menghubungi server. Coba lagi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [retry]);

  const handleRetry = () => {
    setApps(null);
    setJobs(null);
    setError(null);
    setNeedsLogin(false);
    setRetry((r) => r + 1);
  };

  const name = nameFromEmail(email);
  const greeting = `${greetingForHour(new Date().getHours())}${name ? `, ${name}` : ""}`;
  const loading = apps === null || jobs === null;

  if (error) {
    return (
      <div className="space-y-6">
        <WelcomeBanner
          eyebrow="Dashboard Jobseeker"
          title={greeting}
          desc={email ?? "Pantau lamaran dan temukan peluang terbaikmu."}
          actions={
            <Link
              href="/lowongan"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-6 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Cari Lowongan
              <span aria-hidden="true">→</span>
            </Link>
          }
        />
        <ErrorState message={error} needsLogin={needsLogin} onRetry={handleRetry} />
      </div>
    );
  }

  if (loading || apps === null || jobs === null) {
    return (
      <div className="space-y-6">
        <WelcomeBanner
          eyebrow="Dashboard Jobseeker"
          title={greeting}
          desc={email ?? "Pantau lamaran dan temukan peluang terbaikmu."}
          actions={
            <Link
              href="/lowongan"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-6 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Cari Lowongan
              <span aria-hidden="true">→</span>
            </Link>
          }
        />
        <SkeletonStats />
        <SkeletonRows />
      </div>
    );
  }

  const appliedIds = new Set(apps.map((a) => a.job_id));
  const companies = new Set(apps.map((a) => a.company)).size;
  const recentApps = apps.slice(0, 5);
  const freshJobs = jobs.filter((j) => !appliedIds.has(j.id)).slice(0, 3);

  return (
    <div className="space-y-6">
      <WelcomeBanner
        eyebrow="Dashboard Jobseeker"
        title={greeting}
        desc={
          apps.length > 0
            ? `Kamu telah melamar ${apps.length} lowongan. Tetap semangat!`
            : "Mulai perjalanan kariermu dengan menjelajahi lowongan yang tersedia."
        }
        delay={0}
        actions={
          <>
            <Link
              href="/lowongan"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-6 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Cari Lowongan
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/applications"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Lamaran Saya
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon="file"
          tint="bg-brand-50 text-brand-600"
          value={String(apps.length)}
          label="Lamaran terkirim"
          href="/applications"
          linkLabel="Lihat lamaran"
          delay={60}
        />
        <StatCard
          icon="search"
          tint="bg-violet-50 text-accent-600"
          value={String(jobs.length)}
          label="Lowongan tersedia"
          href="/lowongan"
          linkLabel="Jelajahi lowongan"
          delay={120}
        />
        <StatCard
          icon="building"
          tint="bg-emerald-50 text-emerald-600"
          value={String(companies)}
          label="Perusahaan dilamar"
          href="/applications"
          linkLabel="Lihat sebaran"
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section
          aria-label="Aktivitas terbaru"
          className="animate-dash-rise rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold tracking-tight text-ink-900">
              Aktivitas Terbaru
            </h2>
            <Link
              href="/applications"
              className="shrink-0 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Semua →
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Belum ada lamaran"
                desc="Lamaran yang kamu kirim akan tercatat di sini beserta tanggalnya."
                href="/lowongan"
                actionLabel="Cari Lowongan"
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100" role="list">
              {recentApps.map((app) => (
                <li key={app.id}>
                  <Link
                    href={`/jobs/${app.job_id}`}
                    className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
                    >
                      <StatIcon kind="file" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink-900">
                        {app.title}
                      </span>
                      <span className="block truncate text-xs text-ink-500">
                        {app.company} · Dilamar {formatDateId(app.created_at)}
                      </span>
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-ink-500">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-label="Lowongan untukmu"
          className="animate-dash-rise rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6"
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold tracking-tight text-ink-900">
              Untukmu
            </h2>
            <Link
              href="/lowongan"
              className="shrink-0 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Semua →
            </Link>
          </div>
          {freshJobs.length === 0 ? (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-5 text-center text-sm leading-relaxed text-ink-500">
              {jobs.length === 0
                ? "Belum ada lowongan saat ini."
                : "Semua lowongan sudah kamu lamar. Kerja bagus!"}
            </p>
          ) : (
            <ul className="mt-4 space-y-3" role="list">
              {freshJobs.map((job) => (
                <li
                  key={job.id}
                  className="rounded-xl border border-slate-200/70 p-4 transition-shadow duration-200 hover:shadow-sm"
                >
                  <p className="truncate text-sm font-medium text-ink-900">{job.title}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-500">
                    {job.company} · {job.location}
                  </p>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="mt-2 inline-flex text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  >
                    Lihat Detail →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function RecruiterDashboard({ email }: { email: string | null }) {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [counts, setCounts] = useState<Record<number, number> | null>(null);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [recentApplicants, setRecentApplicants] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<{ success: boolean; message?: string; jobs?: Job[] }>(
          "/recruiter/jobs",
        );
        if (cancelled) return;
        if (!(res.success && Array.isArray(res.jobs))) {
          const message = res.message ?? "Gagal mengambil lowongan.";
          if (isTokenMessage(message) || message === "Akses ditolak") {
            setNeedsLogin(true);
            setError("Sesi berakhir atau kamu belum masuk. Masuk untuk melihat dashboard.");
          } else {
            setError(message);
          }
          return;
        }
        const list = res.jobs;
        setJobs(list);
        if (list.length === 0) {
          setCounts({});
          return;
        }
        const results = await Promise.allSettled(
          list.map((job) =>
            apiFetch<{ success: boolean; message?: string; applications?: Applicant[] }>(
              `/jobs/${job.id}/applications`,
            ),
          ),
        );
        if (cancelled) return;
        const map: Record<number, number> = {};
        let total = 0;
        let recent = 0;
        results.forEach((r, idx) => {
          const id = list[idx].id;
          if (r.status === "fulfilled" && r.value.success && Array.isArray(r.value.applications)) {
            const items = r.value.applications;
            map[id] = items.length;
            total += items.length;
            recent += items.filter((a) => isWithinDays(a.created_at, 7)).length;
          } else {
            map[id] = 0;
          }
        });
        setCounts(map);
        setTotalApplicants(total);
        setRecentApplicants(recent);
      } catch {
        if (!cancelled) setError("Gagal menghubungi server. Coba lagi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [retry]);

  const handleRetry = () => {
    setJobs(null);
    setCounts(null);
    setTotalApplicants(0);
    setRecentApplicants(0);
    setError(null);
    setNeedsLogin(false);
    setRetry((r) => r + 1);
  };

  const name = nameFromEmail(email);
  const greeting = `${greetingForHour(new Date().getHours())}${name ? `, ${name}` : ""}`;
  const loadingJobs = jobs === null;
  const loadingCounts = counts === null;

  const createCta = (
    <Link
      href="/jobs/create"
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-6 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Buat Lowongan
    </Link>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <WelcomeBanner
          eyebrow="Dashboard Recruiter"
          title={greeting}
          desc={email ?? "Kelola lowongan dan pantau pelamar dari satu tempat."}
          actions={createCta}
        />
        <ErrorState message={error} needsLogin={needsLogin} onRetry={handleRetry} />
      </div>
    );
  }

  if (loadingJobs || jobs === null) {
    return (
      <div className="space-y-6">
        <WelcomeBanner
          eyebrow="Dashboard Recruiter"
          title={greeting}
          desc={email ?? "Kelola lowongan dan pantau pelamar dari satu tempat."}
          actions={createCta}
        />
        <SkeletonStats />
        <SkeletonRows />
      </div>
    );
  }

  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="space-y-6">
      <WelcomeBanner
        eyebrow="Dashboard Recruiter"
        title={greeting}
        desc={
          jobs.length > 0
            ? `Kamu mengelola ${jobs.length} lowongan dengan ${loadingCounts ? "…" : totalApplicants} pelamar.`
            : "Publikasikan lowongan pertamamu dan temukan kandidat terbaik."
        }
        delay={0}
        actions={
          <>
            {createCta}
            <Link
              href="/recruiter/jobs"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Lowongan Saya
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon="briefcase"
          tint="bg-brand-50 text-brand-600"
          value={String(jobs.length)}
          label="Lowongan saya"
          href="/recruiter/jobs"
          linkLabel="Kelola lowongan"
          delay={60}
        />
        <StatCard
          icon="users"
          tint="bg-violet-50 text-accent-600"
          value={loadingCounts ? "…" : String(totalApplicants)}
          label="Total pelamar"
          href="/recruiter/jobs"
          linkLabel="Lihat per lowongan"
          delay={120}
        />
        <StatCard
          icon="clock"
          tint="bg-emerald-50 text-emerald-600"
          value={loadingCounts ? "…" : String(recentApplicants)}
          label="Pelamar 7 hari terakhir"
          href="/recruiter/jobs"
          linkLabel="Tinjau pelamar"
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section
          aria-label="Lowongan terbaru"
          className="animate-dash-rise rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold tracking-tight text-ink-900">
              Lowongan Terbaru
            </h2>
            <Link
              href="/recruiter/jobs"
              className="shrink-0 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Semua →
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Belum ada lowongan"
                desc="Buat lowongan pertamamu — pelamar yang masuk akan tercatat di dashboard ini."
                href="/jobs/create"
                actionLabel="Buat Lowongan"
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100" role="list">
              {recentJobs.map((job) => {
                const n = counts?.[job.id];
                return (
                  <li key={job.id} className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
                      >
                        <StatIcon kind="briefcase" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-900">{job.title}</p>
                        <p className="truncate text-xs text-ink-500">
                          {job.company} · {n === undefined ? "Memuat pelamar…" : `${n} pelamar`}
                        </p>
                      </div>
                      <Link
                        href={`/recruiter/jobs/${job.id}/applicants`}
                        className="shrink-0 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/15 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      >
                        Pelamar
                      </Link>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 pl-[52px]">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-xs font-medium text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      >
                        Detail
                      </Link>
                      <Link
                        href={`/recruiter/jobs/${job.id}/edit`}
                        className="text-xs font-medium text-ink-500 transition-colors hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      >
                        Edit
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          aria-label="Aksi cepat"
          className="animate-dash-rise rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6"
          style={{ animationDelay: "300ms" }}
        >
          <h2 className="font-display text-base font-semibold tracking-tight text-ink-900">
            Aksi Cepat
          </h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/jobs/create"
              className="flex items-center gap-3 rounded-xl border border-slate-200/70 p-4 transition-colors hover:border-brand-600/30 hover:bg-brand-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block text-sm font-medium text-ink-900">Buat Lowongan</span>
                <span className="block text-xs text-ink-500">Publikasikan posisi baru</span>
              </span>
            </Link>
            <Link
              href="/recruiter/jobs"
              className="flex items-center gap-3 rounded-xl border border-slate-200/70 p-4 transition-colors hover:border-brand-600/30 hover:bg-brand-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
              >
                <StatIcon kind="briefcase" />
              </span>
              <span>
                <span className="block text-sm font-medium text-ink-900">Kelola Lowongan</span>
                <span className="block text-xs text-ink-500">Edit, hapus, lihat pelamar</span>
              </span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl border border-slate-200/70 p-4 transition-colors hover:border-brand-600/30 hover:bg-brand-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-accent-600"
              >
                <StatIcon kind="users" />
              </span>
              <span>
                <span className="block text-sm font-medium text-ink-900">Profil Saya</span>
                <span className="block text-xs text-ink-500">Kelola foto profil</span>
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function WelcomeBanner({
  eyebrow,
  title,
  desc,
  actions,
  delay = 0,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  actions: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      aria-label="Sambutan"
      className="animate-dash-rise relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-brand-600/15 to-accent-600/15 blur-2xl"
      />
      <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/15">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-600" />
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-500">{desc}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div>
      </div>
    </section>
  );
}

export default function HomePage() {
  // Role & email dibaca sekali dari token lokal (lazy initializer, tanpa
  // effect) — hanya untuk memilih tampilan. Akses dijaga RequireAuth
  // (validasi token ke backend); otorisasi tetap di backend.
  const [role] = useState<UserRole | null>(() => getRoleFromToken());
  const [email] = useState<string | null>(() => getEmailFromToken());

  const subtitle =
    role === "recruiter"
      ? "Kelola lowongan dan pantau pelamar"
      : "Pantau lamaran dan temukan peluang terbaik";

  return (
    <RequireAuth>
      <AppShell title="Dashboard" subtitle={subtitle}>
        {role === "recruiter" ? (
          <RecruiterDashboard email={email} />
        ) : (
          <JobseekerDashboard email={email} />
        )}
      </AppShell>
    </RequireAuth>
  );
}
