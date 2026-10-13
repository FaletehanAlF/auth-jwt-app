"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaBuilding,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaFileAlt,
  FaInbox,
  FaMapMarkerAlt,
} from "react-icons/fa";
import AppShell from "../../components/AppShell";
import RequireAuth from "../../components/RequireAuth";
import { apiFetch } from "../../lib/api";
import { getStatusInfo } from "../../lib/applicationStatus";
import type { Application } from "../../lib/types";

/** `created_at` nullable di skema — jangan pernah new Date(null). */
function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SkeletonList() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
          <div className="h-5 w-2/5 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-1/4 rounded bg-slate-100" />
          <div className="mt-4 h-4 w-3/4 rounded bg-slate-100" />
          <div className="mt-6 h-10 w-32 rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{
          success: boolean;
          message?: string;
          applications?: Application[];
        }>("/applications/me");
        if (cancelled) return;

        if (data.success && Array.isArray(data.applications)) {
          setError(null);
          setNeedsLogin(false);
          setApplications(data.applications);
        } else {
          const message = data.message ?? "Gagal mengambil lamaran.";
          if (
            message === "Token tidak ditemukan" ||
            message === "Token tidak valid atau sudah expired"
          ) {
            setNeedsLogin(true);
            setError("Silakan login terlebih dahulu untuk melihat lamaran.");
          } else {
            setError(message);
          }
        }
      } catch {
        if (!cancelled) setError("Gagal menghubungi server. Periksa koneksi lalu coba lagi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const loading = applications === null;
  const list = applications ?? [];

  const retry = () => {
    setApplications(null);
    setError(null);
    setNeedsLogin(false);
    setAttempt((n) => n + 1);
  };

  return (
    <RequireAuth roles={["jobseeker"]}>
      <AppShell title="Lamaran Saya" subtitle="Pantau status lamaranmu">
        <div className="space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                Lamaran Saya
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Pantau semua lamaran yang telah kamu kirim.
              </p>
            </div>
            {!loading && !error && (
              <p className="flex shrink-0 items-center gap-2 text-sm text-ink-500" aria-live="polite">
                <FaFileAlt aria-hidden="true" className="h-4 w-4" />
                {list.length} lamaran terkirim
              </p>
            )}
          </header>

          {loading && <SkeletonList />}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"
              >
                <FaExclamationTriangle className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-base font-semibold tracking-tight text-ink-900">
                Gagal memuat lamaran
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">{error}</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {needsLogin ? (
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  >
                    Masuk ke Akun
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={retry}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  >
                    Coba Lagi
                  </button>
                )}
              </div>
            </div>
          )}

          {!loading && !error && list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-ink-500"
              >
                <FaInbox className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-base font-semibold tracking-tight text-ink-900">
                Belum ada lamaran
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">
                Kamu belum mengirim lamaran. Jelajahi lowongan yang tersedia dan mulai melamar.
              </p>
              <div className="mt-5 flex justify-center">
                <Link
                  href="/lowongan"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Cari Lowongan
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && list.length > 0 && (
            <section aria-label="Daftar lamaran" className="space-y-4">
              {list.map((app) => {
                const applied = formatDate(app.created_at);
                return (
                  <article
                    key={app.id}
                    className="animate-dash-rise rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
                  >
                    <h2 className="font-display text-base font-semibold tracking-tight text-ink-900">
                      {app.title}
                    </h2>
                    <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                      <li className="flex items-center gap-1.5">
                        <FaBuilding aria-hidden="true" className="h-4 w-4 shrink-0" />
                        {app.company}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <FaMapMarkerAlt aria-hidden="true" className="h-4 w-4 shrink-0" />
                        {app.location}
                      </li>
                    </ul>
                    {app.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-500">
                        {app.description}
                      </p>
                    )}
                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-1.5 text-xs text-ink-500">
                        <FaCalendarAlt aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                        {applied ? `Dilamar ${applied}` : "Tanggal lamaran tidak tersedia"}
                      </p>
                      <Link
                        href={`/jobs/${app.job_id}`}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 px-4 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-600/15 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      >
                        Lihat Lowongan
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
