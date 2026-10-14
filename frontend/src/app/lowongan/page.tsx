"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaInbox,
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import AppShell from "../../components/layout/AppShell";
import RequireAuth from "../../components/auth/RequireAuth";
import { apiFetch } from "../../lib/api";
import type { Job } from "../../lib/types";

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

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
          <div className="h-5 w-3/5 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-2/5 rounded bg-slate-100" />
          <div className="mt-4 h-4 w-full rounded bg-slate-100" />
          <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
          <div className="mt-6 h-10 w-32 rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function LowonganPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ success: boolean; message?: string; jobs?: Job[] }>("/jobs");
        if (cancelled) return;
        if (data.success && Array.isArray(data.jobs)) {
          setError(null);
          setNeedsLogin(false);
          setJobs(data.jobs);
        } else if (
          data.message === "Token tidak ditemukan" ||
          data.message === "Token tidak valid atau sudah expired"
        ) {
          setError("Silakan login terlebih dahulu untuk melihat lowongan.");
          setNeedsLogin(true);
        } else {
          setError(data.message ?? "Gagal mengambil data lowongan.");
        }
      } catch {
        if (!cancelled) setError("Gagal menghubungi server. Periksa koneksi lalu coba lagi.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // Di-refresh diam-diam saat lowongan dibuat/diubah di halaman lain.
  useEffect(() => {
    const onChanged = () => setAttempt((n) => n + 1);
    window.addEventListener("jobs-changed", onChanged);
    return () => window.removeEventListener("jobs-changed", onChanged);
  }, []);

  const loading = jobs === null;
  const list = useMemo(() => jobs ?? [], [jobs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((job) =>
      [job.title, job.company, job.location].some((field) => field.toLowerCase().includes(q)),
    );
  }, [list, query]);

  const retry = () => {
    setJobs(null);
    setError(null);
    setNeedsLogin(false);
    setAttempt((n) => n + 1);
  };

  return (
    <RequireAuth>
      <AppShell title="Cari Lowongan" subtitle="Jelajahi lowongan yang tersedia">
        <div className="space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                Cari Lowongan
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Jelajahi lowongan yang tersedia dan temukan yang sesuai untukmu.
              </p>
            </div>
            {!loading && !error && (
              <p className="flex shrink-0 items-center gap-2 text-sm text-ink-500" aria-live="polite">
                <FaBriefcase aria-hidden="true" className="h-4 w-4" />
                {list.length} lowongan tersedia
              </p>
            )}
          </header>

          {!error && !loading && list.length > 0 && (
            <div className="relative">
              <label htmlFor="cari-lowongan" className="sr-only">
                Cari lowongan
              </label>
              <FaSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
              />
              <input
                id="cari-lowongan"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari judul, perusahaan, atau lokasi…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-ink-900 placeholder:text-ink-500 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-0"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-slate-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  <FaTimes aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {loading && <SkeletonGrid />}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"
              >
                <FaExclamationTriangle className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-base font-semibold tracking-tight text-ink-900">
                Gagal memuat lowongan
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
                Belum ada lowongan
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">
                Belum ada lowongan saat ini. Silakan kembali lagi nanti.
              </p>
            </div>
          )}

          {!loading && !error && list.length > 0 && visible.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-ink-500"
              >
                <FaSearch className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-base font-semibold tracking-tight text-ink-900">
                Tidak ada lowongan yang cocok
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">
                {`Tidak ada hasil untuk "${query.trim()}". Coba kata kunci lain atau kosongkan pencarian.`}
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Bersihkan pencarian
                </button>
              </div>
            </div>
          )}

          {!loading && !error && visible.length > 0 && (
            <>
              {query.trim() && (
                <p className="text-sm text-ink-500" aria-live="polite">
                  Menampilkan {visible.length} dari {list.length} lowongan
                </p>
              )}
              <section aria-label="Daftar lowongan" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {visible.map((job) => {
                  const created = formatDate(job.created_at);
                  return (
                    <article
                      key={job.id}
                      className="animate-dash-rise flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
                    >
                      <h2 className="font-display text-base font-semibold tracking-tight text-ink-900">
                        {job.title}
                      </h2>
                      <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                        <li className="flex items-center gap-1.5">
                          <FaBuilding aria-hidden="true" className="h-4 w-4 shrink-0" />
                          {job.company}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <FaMapMarkerAlt aria-hidden="true" className="h-4 w-4 shrink-0" />
                          {job.location}
                        </li>
                      </ul>
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-500">
                        {job.description}
                      </p>
                      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="flex items-center gap-1.5 text-xs text-ink-500">
                          <FaCalendarAlt aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                          {created ? `Diposting ${created}` : "Tanggal posting tidak tersedia"}
                        </p>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 px-4 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-600/15 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </section>
            </>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
