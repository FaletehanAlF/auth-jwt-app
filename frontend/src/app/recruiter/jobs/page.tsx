"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../../components/AppShell";
import Reveal from "../../../components/Reveal";
import SplitText from "../../../components/SplitText";
import { apiFetch } from "../../../lib/api";
import CreateJobWidget from "../../../components/CreateJobWidget";
import BorderGlow from "../../../components/BorderGlow";
import type { Job } from "../../../lib/types";

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
        window.dispatchEvent(new Event("jobs-changed"));
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
    const fetchJobs = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
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
    const onChanged = () => fetchJobs(false);
    window.addEventListener("jobs-changed", onChanged);
    return () => window.removeEventListener("jobs-changed", onChanged);
  }, []);

  return (
    <AppShell title="Lowongan Saya" subtitle="Kelola lowongan yang kamu publikasikan">
      <div className="rounded-2xl bg-neutral-950 p-6 text-white sm:p-8">
        <Reveal direction="left" delay={0}>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <SplitText text="Lowongan" direction="left" charDelay={20} />
          </h1>
        </Reveal>
        <div className="mt-4">
          <Link
            href="/jobs/create"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
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
          <Reveal direction="right" delay={120}>
            <div className="mt-6 grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <BorderGlow
                key={job.id}
                borderRadius={12}
                backgroundColor="#171717"
                glowColor="217 91 60"
                colors={["#3b82f6", "#60a5fa", "#818cf8"]}
                className="px-5 py-5"
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
              </BorderGlow>
            ))}
            </div>
          </Reveal>
        )}
      </div>
      <CreateJobWidget />
    </AppShell>
  );
}
