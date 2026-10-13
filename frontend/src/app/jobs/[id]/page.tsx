"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FaArrowLeft,
  FaBuilding,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import AppShell from "../../../components/AppShell";
import RequireAuth from "../../../components/RequireAuth";
import { apiFetch } from "../../../lib/api";
import type { Job } from "../../../lib/types";

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

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<{
          success: boolean;
          message?: string;
          job?: Job;
        }>(`/jobs/${id}`);
        if (cancelled) return;
        if (data.success && data.job) {
          setJob(data.job);
        } else {
          setJob(null);
          setError(data.message ?? "Lowongan tidak ditemukan.");
        }
      } catch {
        if (!cancelled) {
          setJob(null);
          setError("Gagal menghubungi server. Periksa koneksi lalu coba lagi.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const created = formatDate(job?.created_at);

  return (
    <RequireAuth>
      <AppShell title="Detail Lowongan" subtitle="Informasi lengkap lowongan">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <Link
            href="/lowongan"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-500 transition-colors hover:bg-slate-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <FaArrowLeft aria-hidden="true" className="h-4 w-4" />
            Kembali ke Lowongan
          </Link>

          {loading && (
            <div
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
              aria-hidden="true"
            >
              <div className="h-6 w-3/5 rounded bg-slate-100" />
              <div className="mt-3 h-4 w-2/5 rounded bg-slate-100" />
              <div className="mt-6 space-y-2">
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-4/5 rounded bg-slate-100" />
              </div>
              <div className="mt-6 h-11 w-40 rounded-xl bg-slate-100" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"
              >
                <FaExclamationTriangle className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-base font-semibold tracking-tight text-ink-900">
                Gagal memuat detail lowongan
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">{error}</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAttempt((n) => n + 1)}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Coba Lagi
                </button>
                <Link
                  href="/lowongan"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Kembali
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && job && (
            <article className="animate-dash-rise rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <p className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/15">
                Lowongan tersedia
              </p>
              <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink-900">
                {job.title}
              </h1>
              <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                <li className="flex items-center gap-1.5">
                  <FaBuilding aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {job.company}
                </li>
                <li className="flex items-center gap-1.5">
                  <FaMapMarkerAlt aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {job.location}
                </li>
                <li className="flex items-center gap-1.5">
                  <FaCalendarAlt aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {created ? `Diposting ${created}` : "Tanggal posting tidak tersedia"}
                </li>
              </ul>
              <div className="mt-5 border-t border-slate-100 pt-5">
                <h2 className="text-sm font-medium text-ink-900">Deskripsi pekerjaan</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-500">
                  {job.description}
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row">
                <Link
                  href="/lowongan"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Lihat Lowongan Lainnya
                </Link>
                <Link
                  href="/applications"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Lamaran Saya
                </Link>
              </div>
            </article>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
