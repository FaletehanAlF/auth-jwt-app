"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FaCheck, FaExclamationTriangle, FaSpinner, FaTimes } from "react-icons/fa";
import { apiFetch } from "../lib/api";
import type { Job } from "../lib/types";

type JobFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  jobId?: number | null;
  onClose: () => void;
  onSuccess?: () => void;
};

type FieldErrors = {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
};

function readableError(message: string | undefined, fallback: string): string {
  if (message === "Token tidak ditemukan" || message === "Token tidak valid atau sudah expired") {
    return "Sesi kamu sudah berakhir. Silakan masuk kembali.";
  }
  if (message === "Akses ditolak" || message === "Anda tidak memiliki akses ke job ini") {
    return "Kamu tidak memiliki akses ke lowongan ini.";
  }
  if (message === "Job tidak ditemukan") return "Lowongan tidak ditemukan.";
  return message ?? fallback;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink-900">{label}</label>
      {children}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export default function JobFormModal({ open, mode, jobId, onClose, onSuccess }: JobFormModalProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [initial, setInitial] = useState({ title: "", company: "", location: "", description: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingJob, setLoadingJob] = useState(mode === "edit");
  const [jobError, setJobError] = useState<string | null>(null);

  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleText = mode === "create" ? "Buat Lowongan" : "Edit Lowongan";
  const submitLabel = mode === "create" ? "Simpan Lowongan" : "Simpan Perubahan";
  const submittingLabel = mode === "create" ? "Menyimpan Lowongan..." : "Menyimpan Perubahan...";
  const successMessage = mode === "create" ? "Lowongan berhasil dibuat!" : "Perubahan berhasil disimpan.";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setError(null);
      setJobError(null);
      setFieldErrors({});
      setSuccess(false);
      setSubmitting(false);

      if (mode === "create") {
        setTitle("");
        setCompany("");
        setLocation("");
        setDescription("");
        setInitial({ title: "", company: "", location: "", description: "" });
        setLoadingJob(false);
        return;
      }

      setLoadingJob(true);
      try {
        const data = await apiFetch<{ success: boolean; message?: string; job?: Job }>(`/jobs/${jobId}`);
        if (cancelled) return;
        if (data.success && data.job) {
          const job = data.job;
          setTitle(job.title ?? "");
          setCompany(job.company ?? "");
          setLocation(job.location ?? "");
          setDescription(job.description ?? "");
          const nextInitial = {
            title: job.title ?? "",
            company: job.company ?? "",
            location: job.location ?? "",
            description: job.description ?? "",
          };
          setInitial(nextInitial);
        } else {
          setJobError(readableError(data.message, "Gagal memuat data lowongan."));
        }
      } catch {
        if (!cancelled) setJobError("Gagal memuat data lowongan.");
      } finally {
        if (!cancelled) setLoadingJob(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, mode, jobId]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (!loadingJob && !jobError) {
        firstFieldRef.current?.focus();
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [open, loadingJob, jobError]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        if (submitting || success) return;
        if (!isDirty()) return;
        handleAttemptClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submitting, success, title, company, location, description, initial]);

  function isDirty() {
    return (
      title.trim() !== initial.title.trim() ||
      company.trim() !== initial.company.trim() ||
      location.trim() !== initial.location.trim() ||
      description.trim() !== initial.description.trim()
    );
  }

  const handleAttemptClose = () => {
    if (submitting || success) return;
    if (isDirty()) {
      const ok = window.confirm("Perubahan belum disimpan. Yakin ingin menutup?");
      if (!ok) return;
    }
    onClose();
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = "Judul wajib diisi.";
    if (!company.trim()) next.company = "Perusahaan wajib diisi.";
    if (!location.trim()) next.location = "Lokasi wajib diisi.";
    if (!description.trim()) next.description = "Deskripsi wajib diisi.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || success || loadingJob) return;
    setError(null);
    if (!validate()) return;

    try {
      setSubmitting(true);
      const body = JSON.stringify({
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        description: description.trim(),
      });

      const data = await apiFetch<{ success: boolean; message?: string }>(
        mode === "create" ? "/jobs" : `/jobs/${jobId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          body,
        },
      );

      if (data.success === true) {
        setSuccess(true);
        window.dispatchEvent(new Event("jobs-changed"));
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        closeTimerRef.current = setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 900);
        return;
      }

      const message = data.message ?? (mode === "create" ? "Gagal membuat lowongan." : "Gagal memperbarui lowongan.");
      if (
        message === "Token tidak ditemukan" ||
        message === "Token tidak valid atau sudah expired"
      ) {
        setError("Silakan login terlebih dahulu.");
      } else if (message === "Akses ditolak" || message === "Anda tidak memiliki akses ke job ini") {
        setError("Kamu tidak memiliki akses ke lowongan ini.");
      } else if (message === "Job tidak ditemukan") {
        setError("Lowongan tidak ditemukan.");
      } else {
        setError(message);
      }
    } catch {
      setError(mode === "create" ? "Gagal membuat lowongan. Coba lagi." : "Gagal memperbarui lowongan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
      onClick={handleAttemptClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="app-menu-pop w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id="job-form-title" className="font-display text-lg font-semibold tracking-tight text-ink-900">
              {titleText}
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {mode === "create"
                ? "Isi detail lowongan, lalu simpan."
                : "Perbarui informasi lowongan."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAttemptClose}
            disabled={submitting || success}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          {loadingJob ? (
            <div className="space-y-4" role="status" aria-label="Memuat data lowongan">
              <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
              </div>
              <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ) : jobError ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {jobError}
            </div>
          ) : success ? (
            <div className="py-6 text-center">
              <span
                aria-hidden="true"
                className="animate-jobtrack-success mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
              >
                <FaCheck className="h-7 w-7" />
              </span>
              <p className="mt-4 font-display text-base font-semibold tracking-tight text-ink-900">
                {successMessage}
              </p>
              <p className="mt-1 text-sm text-ink-500">Daftar lowongan akan diperbarui.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Judul Lowongan" error={fieldErrors.title}>
                <input
                  ref={firstFieldRef}
                  id="job-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Frontend Developer"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-500 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Perusahaan" error={fieldErrors.company}>
                  <input
                    id="job-company"
                    type="text"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Contoh: PT JobTrack"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-500 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  />
                </Field>
                <Field label="Lokasi" error={fieldErrors.location}>
                  <input
                    id="job-location"
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Contoh: Jakarta"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-500 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  />
                </Field>
              </div>

              <Field label="Deskripsi" error={fieldErrors.description}>
                <textarea
                  id="job-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Jelaskan tanggung jawab dan kualifikasi singkat..."
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                />
              </Field>

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <FaExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  {submitting && <FaSpinner className="h-4 w-4 animate-spin" />}
                  {submitting ? submittingLabel : submitLabel}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
