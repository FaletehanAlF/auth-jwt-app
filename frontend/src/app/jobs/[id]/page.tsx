"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowLeft,
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaUserTag,
} from "react-icons/fa";
import AppShell from "../../../components/layout/AppShell";
import RequireAuth from "../../../components/auth/RequireAuth";
import { apiFetch, apiFetchWithStatus } from "../../../lib/api";
import { getStatusInfo } from "../../../lib/applicationStatus";
import { getRoleFromToken, type UserRole } from "../../../lib/auth";
import { formatUsername } from "../../../lib/username";
import type { Application, Job } from "../../../lib/types";

/** Balasan POST /jobs/:id/apply (lihat backend applyJob). */
type ApplyResponse = {
  success: boolean;
  message?: string;
  application?: { status?: string };
};

/** Pesan sekali-pakai setelah aksi melamar. */
type ApplyFeedback = {
  tone: "success" | "info" | "error";
  message: string;
  needsLogin?: boolean;
};

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

function isSafeBackUrl(value: string | null, role: UserRole | null): value is string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return false;
  const queryIndex = value.indexOf("?");
  const path = queryIndex >= 0 ? value.slice(0, queryIndex) : value;
  if (path.startsWith("/jobs/")) return false;
  if (path.startsWith("/recruiter/") && role !== "recruiter") return false;
  if (path === "/applications" && role !== "jobseeker") return false;
  return true;
}

function defaultBackUrl(role: UserRole | null): string {
  return role === "recruiter" ? "/recruiter/jobs" : "/lowongan";
}

export default function JobDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params?.id;
  /** `useParams` bisa mengembalikan string[], ambil satu nilai numerik. */
  const jobId = Array.isArray(id) ? Number(id[0]) : Number(id);

  // Role dibaca dari token lokal hanya untuk gating CTA. Otorisasi
  // sesungguhnya tetap di backend (verifyToken + authorize). Lazy
  // initializer aman: halaman ini di-render hanya setelah RequireAuth
  // meluluskan sesi, jadi selalu di sisi klien (tidak ada SSR).
  const [role] = useState<UserRole | null>(() => getRoleFromToken());

  const backCandidate =
    searchParams.get("back") ??
    searchParams.get("from") ??
    searchParams.get("returnTo") ??
    searchParams.get("origin") ??
    searchParams.get("return") ??
    null;

  const backUrl = useMemo(() => {
    if (isSafeBackUrl(backCandidate, role) && backCandidate !== `/jobs/${jobId}`) {
      return backCandidate;
    }
    return defaultBackUrl(role);
  }, [backCandidate, role, jobId]);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  /** null = belum diketahui (sedang dicek ke /applications/me). */
  const [appliedFor, setAppliedFor] = useState<number | null>(null);
  const [applied, setApplied] = useState<boolean | null>(null);
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<ApplyFeedback | null>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const MAX_CV_BYTES = 5 * 1024 * 1024;

  /**
   * Navigasi antar lowongan tidak me-remount halaman (segmen rute sama),
   * jadi `applied` dari lowongan sebelumnya harus diabaikan. Pakai
   * `appliedFor === jobId` sebagai penanda nilai ini milik lowongan ini.
   */
  const appliedHere = appliedFor === jobId ? applied : null;

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

  // Hanya jobseeker yang punya lamaran; recruiter/unauthenticated dilewati
  // supaya tidak memanggil endpoint yang memang menolak role-nya.
  useEffect(() => {
    if (role !== "jobseeker" || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{
          success: boolean;
          applications?: Application[];
        }>("/applications/me");
        if (cancelled) return;
        const mine = data.success && Array.isArray(data.applications)
          ? data.applications.find((app) => app.job_id === jobId)
          : undefined;
        setAppliedFor(jobId);
        setApplied(Boolean(mine));
        setAppliedStatus(mine?.status ?? null);
      } catch {
        // Gagal membaca daftar lamaran tidak boleh menyembunyikan tombol:
        // backend tetap menegakkan duplikat lewat 409.
        if (cancelled) return;
        setAppliedFor(jobId);
        setApplied(false);
        setAppliedStatus(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, jobId, role]);

  const handleCvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    // Reset nilai input supaya pemilihan file yang sama tetap memicu onChange.
    event.target.value = "";
    setCvError(null);
    setFeedback(null);
    if (!file) return;
    const isPdf =
      (file.type === "" || file.type === "application/pdf") &&
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setCvFile(null);
      setCvError("CV harus berformat PDF.");
      return;
    }
    if (file.size === 0 || file.size > MAX_CV_BYTES) {
      setCvFile(null);
      setCvError("Ukuran CV maksimal 5 MB.");
      return;
    }
    setCvFile(file);
  };

  const handleApply = async () => {
    if (submitting || appliedHere === true || !id) return;
    if (!cvFile) {
      setFeedback({
        tone: "error",
        message: "Pilih CV terlebih dahulu sebelum mengirim lamaran.",
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("cv", cvFile);

      const { status, data } = await apiFetchWithStatus<ApplyResponse>(
        `/jobs/${id}/apply`,
        { method: "POST", body: formData },
      );

      if (status === 401) {
        setFeedback({
          tone: "error",
          message: "Sesi login kamu berakhir. Silakan masuk kembali untuk mengirim lamaran.",
          needsLogin: true,
        });
        return;
      }

      if (status === 409) {
        // Lamaran sudah ada (pre-check controller atau unique key DB).
        setAppliedFor(jobId);
        setApplied(true);
        setFeedback({
          tone: "info",
          message: data.message ?? "Kamu sudah melamar lowongan ini.",
        });
        return;
      }

      if (status === 201 || (data.success && status < 400)) {
        setAppliedFor(jobId);
        setApplied(true);
        // Backend selalu INSERT dengan status 'pending' (lihat applyJob).
        setAppliedStatus(data.application?.status ?? "pending");
        setCvFile(null);
        setCvError(null);
        setFeedback({
          tone: "success",
          message: data.message ?? "Lamaran berhasil dikirim.",
        });
        return;
      }

      const fallback =
        status >= 500
          ? "Terjadi kesalahan pada server. Coba lagi nanti."
          : "Gagal mengirim lamaran. Periksa koneksi lalu coba lagi.";
      setFeedback({
        tone: "error",
        message: data.message ?? fallback,
      });
    } catch {
      setFeedback({
        tone: "error",
        message: "Gagal menghubungi server. Periksa koneksi lalu coba lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const created = formatDate(job?.created_at);
  const statusInfo = getStatusInfo(appliedStatus);

  return (
    <RequireAuth>
      <AppShell title="Detail Lowongan" subtitle="Informasi lengkap lowongan">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <Link
            href={backUrl}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-500 transition-colors hover:bg-slate-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <FaArrowLeft aria-hidden="true" className="h-4 w-4" />
            Kembali
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
                  href={backUrl}
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
                {job.recruiter_name && (
                  <li className="flex items-center gap-1.5">
                    <FaUserTag aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {formatUsername(job.recruiter_name, "recruiter")}
                  </li>
                )}
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
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex flex-col gap-2 sm:flex-row">
                  {!role && (
                    <Link
                      href="/login"
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                    >
                      Masuk untuk Melamar
                    </Link>
                  )}

                  {role === "jobseeker" && appliedHere === true && (
                    <p className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-50 px-6 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-600/15">
                      <FaCheckCircle aria-hidden="true" className="h-4 w-4" />
                      Sudah Dilamar
                    </p>
                  )}

                  {role === "jobseeker" && appliedHere !== true && (
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor="cv"
                          className="block text-sm font-medium text-ink-900"
                        >
                          CV (wajib)
                        </label>
                        <p className="mt-1 text-xs leading-relaxed text-ink-500">
                          Format PDF, maksimal 5 MB.
                        </p>
                        <input
                          id="cv"
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={handleCvChange}
                          disabled={submitting}
                          className="mt-2 block w-full text-sm text-ink-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 focus-visible:outline-none"
                        />
                        {cvFile && (
                          <p className="mt-2 text-xs text-ink-500">
                            Dipilih: {cvFile.name}
                          </p>
                        )}
                        {cvError && (
                          <p
                            role="alert"
                            className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-red-700"
                          >
                            {cvError}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleApply}
                        disabled={submitting || !cvFile}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      >
                        {submitting ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                            />
                            Mengirim…
                          </>
                        ) : (
                          <>
                            <FaPaperPlane aria-hidden="true" className="h-4 w-4" />
                            Lamar Pekerjaan
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <Link
                    href="/lowongan"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  >
                    Lihat Lowongan Lainnya
                  </Link>
                  {role === "jobseeker" && (
                    <Link
                      href="/applications"
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                    >
                      Lamaran Saya
                    </Link>
                  )}
                </div>

                {role === "jobseeker" && appliedHere === true && (
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-500">
                    Status lamaran
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusInfo.badge}`}
                    >
                      {statusInfo.label}
                    </span>
                  </p>
                )}

                {feedback && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`mt-4 rounded-xl border px-4 py-3 ${
                      feedback.tone === "error"
                        ? "border-red-200 bg-red-50"
                        : feedback.tone === "info"
                          ? "border-brand-600/20 bg-brand-50"
                          : "border-emerald-200 bg-emerald-50"
                    }`}
                  >
                    <p
                      className={`flex items-start gap-2 text-sm ${
                        feedback.tone === "error"
                          ? "text-red-700"
                          : feedback.tone === "info"
                            ? "text-brand-700"
                            : "text-emerald-700"
                      }`}
                    >
                      <span aria-hidden="true" className="mt-0.5 shrink-0">
                        {feedback.tone === "success" ? (
                          <FaCheckCircle className="h-4 w-4" />
                        ) : feedback.tone === "info" ? (
                          <FaInfoCircle className="h-4 w-4" />
                        ) : (
                          <FaExclamationTriangle className="h-4 w-4" />
                        )}
                      </span>
                      {feedback.message}
                    </p>
                    {feedback.needsLogin && (
                      <Link
                        href="/login"
                        className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                      >
                        Masuk ke Akun
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </article>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
