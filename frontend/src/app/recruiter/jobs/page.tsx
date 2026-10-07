"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteMenu from "../../../components/SiteMenu";
import Footer from "../../../components/Footer";
import { apiFetch } from "../../../lib/api";

type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  company: string;
  created_at?: string;
};

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const handleDelete = async (jobId: number) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus lowongan ini?",
    );
    if (!confirmed) return;

    try {
      setDeletingId(jobId);
      setDeleteError(null);
      setDeleteSuccess(null);

      const data = await apiFetch<{ success: boolean; message?: string }>(
        `/jobs/${jobId}`,
        { method: "DELETE" },
      );

      if (data.success === true) {
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
        setDeleteSuccess("Lowongan berhasil dihapus.");
        return;
      }

      const message = data.message ?? "Gagal menghapus lowongan.";
      if (
        message === "Token tidak ditemukan" ||
        message === "Token tidak valid atau sudah expired"
      ) {
        setDeleteError("Silakan login terlebih dahulu.");
      } else if (
        message === "Akses ditolak" ||
        message === "Anda tidak memiliki akses ke job ini"
      ) {
        setDeleteError("Anda tidak memiliki akses ke lowongan ini.");
      } else if (message === "Job tidak ditemukan") {
        setDeleteError("Lowongan tidak ditemukan.");
      } else {
        setDeleteError(message);
      }
    } catch {
      setDeleteError("Gagal menghapus lowongan. Coba lagi.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<{
          success: boolean;
          message?: string;
          jobs?: Job[];
        }>("/recruiter/jobs");

        if (data.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        } else {
          const message = data.message ?? "Gagal mengambil lowongan.";
          if (
            message === "Token tidak ditemukan" ||
            message === "Token tidak valid atau sudah expired"
          ) {
            setError("Silakan login terlebih dahulu.");
          } else if (message === "Akses ditolak") {
            setError("Halaman ini hanya dapat diakses recruiter.");
          } else {
            setError(message);
          }
        }
      } catch {
        setError("Gagal mengambil lowongan.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip overscroll-none bg-neutral-950 text-white">
      <SiteMenu />
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-32 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Lowongan Saya
          </h1>
          <Link
            href="/jobs/create"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-500"
          >
            Buat Lowongan
          </Link>
        </div>

        {deleteSuccess && (
          <p className="mt-4 text-sm text-green-400">{deleteSuccess}</p>
        )}
        {deleteError && (
          <p className="mt-4 text-sm text-red-400">{deleteError}</p>
        )}

        {loading && (
          <p className="mt-6 text-sm text-white/60">Memuat lowongan...</p>
        )}

        {!loading && error && (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        )}

        {!loading && !error && jobs.length === 0 && (
          <p className="mt-6 text-sm text-white/60">
            Kamu belum memiliki lowongan.
          </p>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-white/10 bg-neutral-900 px-5 py-5"
              >
                <h2 className="font-display text-lg font-semibold text-white">
                  {job.title}
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  {job.company} · {job.location}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {job.description}
                </p>
                {job.created_at && (
                  <p className="mt-3 text-xs text-white/50">
                    Dibuat pada{" "}
                    {new Date(job.created_at).toLocaleDateString("id-ID")}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                  >
                    Lihat Detail
                  </Link>
                  <Link
                    href={`/recruiter/jobs/${job.id}/edit`}
                    className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/recruiter/jobs/${job.id}/applicants`}
                    className="text-sm font-medium text-teal-300 transition-colors hover:text-teal-200"
                  >
                    Lihat Pelamar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(job.id)}
                    disabled={deletingId === job.id}
                    className="text-sm font-medium text-red-400 transition-colors hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === job.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
