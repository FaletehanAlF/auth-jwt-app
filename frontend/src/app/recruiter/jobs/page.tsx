"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaEye,
  FaInbox,
  FaMapMarkerAlt,
  FaPencilAlt,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrashAlt,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import AppShell from "../../../components/AppShell";
import RequireAuth from "../../../components/RequireAuth";
import CreateJobWidget from "../../../components/CreateJobWidget";
import { apiFetch } from "../../../lib/api";
import type { Applicant, Job } from "../../../lib/types";

/* ------------------------------------------------------------------ *
 * Batasan data yang dipakai halaman ini.
 *
 * Tabel `jobs` hanya punya 7 kolom (id, title, description, location,
 * company, recruiter_id, created_at) dan `GET /recruiter/jobs` tidak
 * menyertakan hitungan pelamar. Karena itu halaman ini SENGAJA tidak
 * menampilkan status publikasi, tipe pekerjaan, maupun filter status:
 * data itu tidak ada di API, dan mengarangnya berarti berbohong ke
 * recruiter. Jumlah pelamar diambil dari API sungguhan lewat
 * `GET /jobs/:id/applications` (pola yang sama dipakai dashboard /home).
 * ------------------------------------------------------------------ */

type ApplicantsResponse = {
  success: boolean;
  message?: string;
  applications?: Applicant[];
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

/** Pesan error API -> bahasa pengguna, tanpa pernah jadi angka nol. */
function readableError(message: string | undefined, fallback: string): string {
  if (message === "Token tidak ditemukan" || message === "Token tidak valid atau sudah expired") {
    return "Sesi kamu sudah berakhir. Silakan masuk kembali.";
  }
  if (message === "Akses ditolak") return "Halaman ini hanya dapat diakses recruiter.";
  if (message === "Job tidak ditemukan") return "Lowongan tidak ditemukan.";
  if (message === "Anda tidak memiliki akses ke job ini") {
    return "Kamu tidak memiliki akses ke lowongan ini.";
  }
  return message ?? fallback;
}

function StatCard({
  icon: Icon,
  label,
  value,
  pending = false,
}: {
  icon: IconType;
  label: string;
  value: string | number;
  pending?: boolean;
}) {
  return (
    <div className="animate-dash-rise rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
        >
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium text-ink-500">{label}</p>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink-900">
        {pending ? "…" : value}
      </p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-5">
          <div className="h-5 w-2/5 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-1/4 rounded bg-slate-100" />
          <div className="mt-4 h-4 w-3/4 rounded bg-slate-100" />
          <div className="mt-6 flex gap-3">
            <div className="h-10 w-32 rounded-xl bg-slate-100" />
            <div className="h-10 w-28 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: IconType;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <span
        aria-hidden="true"
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-ink-500"
      >
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 font-display text-base font-semibold tracking-tight text-ink-900">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">{desc}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

function JobCard({
  job,
  applicantCount,
  onRequestDelete,
  deleteDisabled,
}: {
  job: Job;
  /** null = belum termuat / gagal dimuat. Tampilkan "—", jangan "0". */
  applicantCount: number | null | undefined;
  onRequestDelete: (job: Job, trigger: HTMLButtonElement) => void;
  deleteDisabled: boolean;
}) {
  const created = formatDate(job.created_at);
  const countLabel =
    applicantCount === null || applicantCount === undefined
      ? "Jumlah pelamar belum tersedia"
      : `${applicantCount} pelamar`;

  return (
    <article className="animate-dash-rise rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold tracking-tight text-ink-900">
            {job.title}
          </h3>
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
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
            applicantCount === 0
              ? "bg-slate-100 text-ink-500"
              : "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/15"
          }`}
        >
          <FaUsers aria-hidden="true" className="h-3.5 w-3.5" />
          {applicantCount === null || applicantCount === undefined
            ? "…"
            : `${applicantCount} pelamar`}
        </span>
      </div>

      {job.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-500">{job.description}</p>
      )}

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <FaCalendarAlt aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {created ? `Dibuat ${created}` : "Tanggal pembuatan tidak tersedia"}
        </p>

        {/* Hierarki aksi: utama filled, sekunder outline, hapus danger. */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/recruiter/jobs/${job.id}/applicants`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <FaUserFriends aria-hidden="true" className="h-4 w-4" />
            Lihat Pelamar
          </Link>
          <Link
            href={`/recruiter/jobs/${job.id}/edit`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <FaPencilAlt aria-hidden="true" className="h-4 w-4" />
            Edit Lowongan
          </Link>
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-500 transition-colors hover:bg-slate-50 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            <FaEye aria-hidden="true" className="h-4 w-4" />
            Detail
          </Link>
          <button
            type="button"
            onClick={(event) => onRequestDelete(job, event.currentTarget)}
            disabled={deleteDisabled}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaTrashAlt aria-hidden="true" className="h-4 w-4" />
            Hapus
          </button>
        </div>
      </div>

      <p className="sr-only">{countLabel}</p>
    </article>
  );
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [counts, setCounts] = useState<Record<number, number | null> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Job | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotice = useCallback((kind: "success" | "error", text: string) => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setNotice({ kind, text });
    if (kind === "success") {
      noticeTimerRef.current = setTimeout(() => setNotice(null), 4000);
    }
  }, []);

  useEffect(
    () => () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch<{ success: boolean; message?: string; jobs?: Job[] }>(
          "/recruiter/jobs",
        );
        if (cancelled) return;

        if (!(res.success && Array.isArray(res.jobs))) {
          setError(readableError(res.message, "Gagal mengambil lowongan."));
          return;
        }

        const list = res.jobs;
        setError(null);
        setJobs(list);

        if (list.length === 0) {
          setCounts({});
          return;
        }

        // Satu request per lowongan — endpoint yang ada tidak menyediakan
        // agregat. Kegagalan per lowongan tidak boleh membuat angka 0
        // palsu, jadi hasilnya `null` (= belum tersedia).
        const results = await Promise.allSettled(
          list.map((job) => apiFetch<ApplicantsResponse>(`/jobs/${job.id}/applications`)),
        );
        if (cancelled) return;

        const map: Record<number, number | null> = {};
        results.forEach((result, index) => {
          const id = list[index].id;
          map[id] =
            result.status === "fulfilled" &&
            result.value.success &&
            Array.isArray(result.value.applications)
              ? result.value.applications.length
              : null;
        });
        setCounts(map);
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

  // Dialog konfirmasi hapus: fokus ke tombol, Escape menutup, fokus balik
  // ke pemicu supaya alur keyboard tidak nyangkut.
  useEffect(() => {
    if (!pendingDelete) return;
    confirmButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingDelete(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pendingDelete]);

  const closeConfirm = useCallback(() => {
    setPendingDelete(null);
    deleteTriggerRef.current?.focus();
  }, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const job = pendingDelete;
    setPendingDelete(null);
    deleteTriggerRef.current = null;
    try {
      setDeletingId(job.id);
      const data = await apiFetch<{ success: boolean; message?: string }>(`/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (data.success === true) {
        setJobs((prev) => (prev ? prev.filter((item) => item.id !== job.id) : prev));
        setCounts((prev) => {
          if (!prev) return prev;
          const next = { ...prev };
          delete next[job.id];
          return next;
        });
        showNotice("success", `Lowongan "${job.title}" berhasil dihapus.`);
        return;
      }
      showNotice("error", readableError(data.message, "Gagal menghapus lowongan."));
    } catch {
      showNotice("error", "Gagal menghapus lowongan. Coba lagi.");
    } finally {
      setDeletingId(null);
    }
  };

  const loading = jobs === null;
  const list = jobs ?? [];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((job) =>
      [job.title, job.company, job.location].some((field) => field.toLowerCase().includes(q)),
    );
  }, [list, query]);

  const totalApplicants = useMemo(() => {
    if (!counts) return null;
    const values = Object.values(counts);
    if (values.length === 0) return 0;
    // Semua request gagal -> jangan tampilkan "0" yang menyesatkan.
    return values.every((value) => value === null) ? null : values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  }, [counts]);

  const locationCount = useMemo(
    () => new Set(list.map((job) => job.location.trim()).filter(Boolean)).size,
    [list],
  );

  const createCta = (
    <Link
      href="/jobs/create"
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
    >
      <FaPlus aria-hidden="true" className="h-4 w-4" />
      Buat Lowongan
    </Link>
  );

  return (
    <RequireAuth roles={["recruiter"]}>
      <AppShell title="Lowongan Saya" subtitle="Kelola lowongan dan pantau kandidat yang melamar">
        {/* pb-24 menyisakan ruang untuk tombol mengambang CreateJobWidget
            (fixed bottom-6 right-6) supaya tidak menutupi card terakhir. */}
        <div className="space-y-6 pb-24">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                Lowongan Saya
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Kelola lowongan dan pantau kandidat yang melamar.
              </p>
            </div>
            {createCta}
          </header>

          {notice && (
            <div
              role={notice.kind === "error" ? "alert" : "status"}
              className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
                notice.kind === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {notice.kind === "error" && <FaExclamationTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>{notice.text}</span>
            </div>
          )}

          {!error && (
            <section aria-label="Ringkasan lowongan" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard icon={FaBriefcase} label="Total lowongan" value={list.length} />
              <StatCard
                icon={FaUsers}
                label="Total pelamar"
                value={totalApplicants ?? "—"}
                pending={counts === null}
              />
              <StatCard icon={FaMapMarkerAlt} label="Kota tujuan" value={locationCount} />
            </section>
          )}

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
                Gagal memuat lowongan
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">{error}</p>
              <button
                type="button"
                onClick={() => setAttempt((n) => n + 1)}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-ink-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && list.length === 0 && (
            <EmptyState
              icon={FaInbox}
              title="Belum ada lowongan"
              desc="Buat lowongan pertamamu supaya kandidat bisa menemukan dan melamar posisi yang kamu buka."
              action={createCta}
            />
          )}

          {!loading && !error && list.length > 0 && visible.length === 0 && (
            <EmptyState
              icon={FaSearch}
              title="Tidak ada lowongan yang cocok"
              desc={`Tidak ada hasil untuk "${query.trim()}". Coba kata kunci lain atau kosongkan pencarian.`}
              action={
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Bersihkan pencarian
                </button>
              }
            />
          )}

          {!loading && !error && visible.length > 0 && (
            <section aria-label="Daftar lowongan" className="space-y-4">
              {visible.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  applicantCount={counts ? (counts[job.id] ?? null) : null}
                  deleteDisabled={deletingId === job.id}
                  onRequestDelete={(target, trigger) => {
                    deleteTriggerRef.current = trigger;
                    setPendingDelete(target);
                  }}
                />
              ))}
            </section>
          )}
        </div>
      </AppShell>

      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="konfirmasi-hapus-judul"
          aria-describedby="konfirmasi-hapus-deskripsi"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
          onClick={closeConfirm}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2
              id="konfirmasi-hapus-judul"
              className="font-display text-base font-semibold tracking-tight text-ink-900"
            >
              Hapus lowongan?
            </h2>
            <p id="konfirmasi-hapus-deskripsi" className="mt-2 text-sm leading-relaxed text-ink-500">
              Lowongan{" "}
              <span className="font-medium text-ink-900">{pendingDelete.title}</span> akan dihapus
              permanen, termasuk seluruh data pelamar yang terkait. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeConfirm}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                Batal
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={confirmDelete}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              >
                <FaTrashAlt aria-hidden="true" className="h-4 w-4" />
                Hapus lowongan
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateJobWidget />
    </RequireAuth>
  );
}
