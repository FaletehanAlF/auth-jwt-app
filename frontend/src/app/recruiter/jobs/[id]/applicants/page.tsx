"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaInbox,
  FaPlus,
  FaUsers,
} from "react-icons/fa";
import AppShell from "../../../../../components/AppShell";
import RequireAuth from "../../../../../components/RequireAuth";
import { apiFetch } from "../../../../../lib/api";
import { APPLICATION_STATUSES, getStatusInfo } from "../../../../../lib/applicationStatus";
import type { Applicant } from "../../../../../lib/types";

function readableError(message: string | undefined, fallback: string): string {
  if (message === "Token tidak ditemukan" || message === "Token tidak valid atau sudah expired") {
    return "Sesi kamu sudah berakhir. Silakan masuk kembali.";
  }
  if (message === "Akses ditolak" || message === "Anda tidak memiliki akses ke lamaran ini") {
    return "Kamu tidak memiliki akses ke pelamar lowongan ini.";
  }
  if (message === "Lamaran tidak ditemukan") {
    return "Lamaran tidak ditemukan. Mungkin sudah dihapus.";
  }
  return message ?? fallback;
}

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
          <div className="mt-4 h-10 w-48 rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function ApplicantsPage() {
  const params = useParams();
  const id = params?.id;

  const [applications, setApplications] = useState<Applicant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Status per pelamar: saving berisi id yang request PATCH-nya berjalan,
  // itemError berisi pesan gagal per id. Keduanya di-key per id supaya
  // pembaruan satu kartu tidak pernah menyentuh kartu lain.
  const [savingIds, setSavingIds] = useState<ReadonlySet<number>>(new Set());
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{
          success: boolean;
          message?: string;
          applications?: Applicant[];
        }>(`/jobs/${id}/applications`);

        if (cancelled) return;
        if (data.success && Array.isArray(data.applications)) {
          setError(null);
          setApplications(data.applications);
        } else {
          const message = data.message ?? "Gagal mengambil data pelamar.";
          if (
            message === "Token tidak ditemukan" ||
            message === "Token tidak valid atau sudah expired"
          ) {
            setError("Silakan login terlebih dahulu.");
          } else if (
            message === "Akses ditolak" ||
            message === "Anda tidak memiliki akses ke job ini"
          ) {
            setError("Anda tidak memiliki akses ke pelamar lowongan ini.");
          } else if (message === "Job tidak ditemukan") {
            setError("Lowongan tidak ditemukan.");
          } else {
            setError(message);
          }
        }
      } catch {
        if (!cancelled) setError("Gagal mengambil data pelamar. Coba lagi.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const loading = applications === null;
  const list = applications ?? [];

  const retry = () => {
    setApplications(null);
    setError(null);
    setItemErrors({});
    setAttempt((n) => n + 1);
  };

  const handleStatusChange = async (applicantId: number, nextStatus: string) => {
    const current = list.find((item) => item.id === applicantId);
    if (!current || current.status === nextStatus || savingIds.has(applicantId)) return;

    setSavingIds((prev) => new Set(prev).add(applicantId));
    setItemErrors((prev) => {
      const rest = { ...prev };
      delete rest[applicantId];
      return rest;
    });

    try {
      const data = await apiFetch<{
        success: boolean;
        message?: string;
        application?: Applicant;
      }>(`/applications/${applicantId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      if (data.success && data.application) {
        // UI mengikuti respons backend, bukan tebakan lokal.
        const savedStatus = data.application.status ?? nextStatus;
        setApplications((prev) =>
          prev ? prev.map((item) => (item.id === applicantId ? { ...item, status: savedStatus } : item)) : prev,
        );
      } else {
        // Gagal: state tidak diubah sehingga tampilan otomatis
        // kembali ke status sebelumnya, plus pesan error per kartu.
        setItemErrors((prev) => ({
          ...prev,
          [applicantId]: readableError(data.message, "Gagal memperbarui status."),
        }));
      }
    } catch {
      setItemErrors((prev) => ({
        ...prev,
        [applicantId]: "Gagal menghubungi server. Periksa koneksi lalu coba lagi.",
      }));
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(applicantId);
        return next;
      });
    }
  };

  return (
    <RequireAuth roles={["recruiter"]}>
      <AppShell title="Pelamar Lowongan" subtitle="Daftar pelamar untuk lowongan ini">
        <div className="space-y-6">
          <Link
            href="/recruiter/jobs"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-500 transition-colors hover:bg-slate-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <FaArrowLeft aria-hidden="true" className="h-4 w-4" />
            Kembali ke Lowongan Saya
          </Link>

          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                Pelamar Lowongan
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Tinjau pelamar dan perbarui status lamaran mereka.
              </p>
            </div>
            {!loading && !error && (
              <p className="flex shrink-0 items-center gap-2 text-sm text-ink-500" aria-live="polite">
                <FaUsers aria-hidden="true" className="h-4 w-4" />
                {list.length} pelamar
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
                Gagal memuat pelamar
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                Coba Lagi
              </button>
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
                Belum ada pelamar
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">
                Belum ada pelamar untuk lowongan ini. Kandidat yang melamar akan muncul di sini.
              </p>
              <div className="mt-5 flex justify-center">
                <Link
                  href="/jobs/create"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  <FaPlus aria-hidden="true" className="h-4 w-4" />
                  Buat Lowongan
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && list.length > 0 && (
            <section aria-label="Daftar pelamar" className="space-y-4">
              {list.map((app) => {
                const name = app.name ?? app.jobseeker_name ?? "Tanpa nama";
                const status = getStatusInfo(app.status);
                const saving = savingIds.has(app.id);
                const itemError = itemErrors[app.id];
                const selectId = `status-pelamar-${app.id}`;
                return (
                  <article
                    key={app.id}
                    className="animate-dash-rise rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-display text-base font-semibold tracking-tight text-ink-900">
                          {name}
                        </h2>
                        <p className="mt-1 truncate text-sm text-ink-500">
                          {app.email ?? app.jobseeker_email ?? "-"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-medium ${status.badge}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        <label
                          htmlFor={selectId}
                          className="block text-xs font-medium text-ink-500"
                        >
                          Status lamaran {name}
                        </label>
                        <select
                          id={selectId}
                          value={app.status ?? ""}
                          disabled={saving}
                          onChange={(event) => handleStatusChange(app.id, event.target.value)}
                          aria-describedby={itemError ? `${selectId}-error` : undefined}
                          className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-ink-900 transition-colors hover:border-brand-600/40 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-56"
                        >
                          {APPLICATION_STATUSES.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                          {app.status &&
                            !APPLICATION_STATUSES.some((option) => option.value === app.status) && (
                              <option value={app.status}>Status tidak diketahui</option>
                            )}
                          {!app.status && <option value="">Status belum tersedia</option>}
                        </select>
                      </div>
                      <p className="flex shrink-0 items-center gap-2 text-xs text-ink-500" aria-live="polite">
                        {saving ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600"
                            />
                            Menyimpan…
                          </>
                        ) : (
                          <>
                            Melamar pada {formatDate(app.created_at) ?? "tanggal tidak tersedia"}
                          </>
                        )}
                      </p>
                    </div>

                    {itemError && (
                      <p
                        id={`${selectId}-error`}
                        role="alert"
                        className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-red-700"
                      >
                        {itemError}
                      </p>
                    )}
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
