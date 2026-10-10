"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../../../components/AppShell";
import { apiFetch } from "../../../../../lib/api";
import type { Job } from "../../../../../lib/types";

export default function EditJobPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<{
          success: boolean;
          message?: string;
          job?: Job;
        }>(`/jobs/${id}`);

        if (data.success && data.job) {
          setJob(data.job);
          setTitle(data.job.title);
          setCompany(data.job.company);
          setLocation(data.job.location);
          setDescription(data.job.description);
        } else {
          const message = data.message ?? "Lowongan tidak ditemukan.";
          if (
            message === "Token tidak ditemukan" ||
            message === "Token tidak valid atau sudah expired"
          ) {
            setError("Silakan login terlebih dahulu.");
          } else if (message === "Akses ditolak") {
            setError("Anda tidak memiliki akses ke lowongan ini.");
          } else if (
            message === "Job tidak ditemukan" ||
            message === "Lowongan tidak ditemukan."
          ) {
            setError("Lowongan tidak ditemukan.");
          } else {
            setError(message);
          }
        }
      } catch {
        setError("Gagal mengambil data lowongan.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !company.trim() ||
      !location.trim() ||
      !description.trim()
    ) {
      setError("Semua field wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const data = await apiFetch<{ success: boolean; message?: string }>(
        `/jobs/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ title, company, location, description }),
        },
      );

      if (data.success === true) {
        setSuccess(true);
        window.dispatchEvent(new Event("jobs-changed"));
        setTimeout(() => router.push("/recruiter/jobs"), 800);
        return;
      }

      const message = data.message ?? "Gagal memperbarui lowongan.";
      if (
        message === "Token tidak ditemukan" ||
        message === "Token tidak valid atau sudah expired"
      ) {
        setError("Silakan login terlebih dahulu.");
      } else if (
        message === "Akses ditolak" ||
        message === "Anda tidak memiliki akses ke job ini"
      ) {
        setError("Anda tidak memiliki akses ke lowongan ini.");
      } else if (message === "Job tidak ditemukan") {
        setError("Lowongan tidak ditemukan.");
      } else {
        setError(message);
      }
    } catch {
      setError("Gagal memperbarui lowongan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Edit Lowongan" subtitle="Perbarui detail lowongan">
      <div className="rounded-2xl bg-neutral-950 p-6 text-white sm:p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Edit Lowongan
        </h1>
        <div className="mt-4">
          <Link
            href="/jobs/create"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            Buat Lowongan
          </Link>
        </div>

        {loading && (
          <p className="mt-6 text-sm text-white/60">
            Memuat data lowongan...
          </p>
        )}

        {!loading && error && !job && (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        )}

        {!loading && job && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="title" className="text-sm text-white/70">
                Judul
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="company" className="text-sm text-white/70">
                Perusahaan
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="text-sm text-white/70">
                Lokasi
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm text-white/70">
                Deskripsi
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
            </button>

            {success && (
              <p className="text-sm text-green-400">
                Lowongan berhasil diperbarui.
              </p>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        )}
      </div>
    </AppShell>
  );
}
