"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../../components/AppShell";
import { apiFetch } from "../../../lib/api";
import { isRecruiter } from "../../../lib/auth";

export default function CreateJobPage() {
  const router = useRouter();

  const [roleChecked, setRoleChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(isRecruiter());
    setRoleChecked(true);
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim() || !company.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const data = await apiFetch<{ success: boolean; message?: string }>(
        "/jobs",
        {
          method: "POST",
          body: JSON.stringify({ title, description, location, company }),
        },
      );

      if (data.success === true) {
        setSuccess(true);
        window.dispatchEvent(new Event("jobs-changed"));
        setTimeout(() => router.push("/lowongan"), 800);
        return;
      }

      const message = data.message ?? "Gagal membuat lowongan.";
      if (
        message === "Token tidak ditemukan" ||
        message === "Token tidak valid atau sudah expired"
      ) {
        setError("Silakan login terlebih dahulu.");
      } else if (message === "Akses ditolak") {
        setError("Hanya recruiter yang dapat membuat lowongan.");
      } else {
        setError(message);
      }
    } catch {
      setError("Gagal membuat lowongan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Buat Lowongan" subtitle="Publikasikan lowongan baru">
      <div className="rounded-2xl bg-neutral-950 p-6 text-white sm:p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Buat Lowongan
        </h1>

        {roleChecked && !allowed && (
          <p className="mt-6 text-sm text-red-400">
            Hanya recruiter yang dapat membuat lowongan.
          </p>
        )}

        {allowed && (
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
            {submitting ? "Membuat Lowongan..." : "Buat Lowongan"}
          </button>

          {success && (
            <p className="text-sm text-green-400">
              Lowongan berhasil dibuat.
            </p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
        )}
      </div>
    </AppShell>
  );
}
