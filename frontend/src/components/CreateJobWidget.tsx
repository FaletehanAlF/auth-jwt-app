"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { isRecruiter } from "../lib/auth";

export default function CreateJobWidget() {
  // Lazy initializer, bukan effect: widget ini hanya dirender di dalam
  // RequireAuth, jadi render pertamanya selalu di sisi klien dan
  // tidak ada risiko hydration mismatch. Menghindari cascading render.
  const [allowed] = useState(() => isRecruiter());
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!allowed) return null;

  const reset = () => {
    setTitle("");
    setCompany("");
    setLocation("");
    setDescription("");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !location.trim() || !description.trim()) {
      setError("Semua field wajib diisi.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const data = await apiFetch<{ success: boolean; message?: string }>(
        "/jobs",
        {
          method: "POST",
          body: JSON.stringify({ title, company, location, description }),
        },
      );
      if (data.success === true) {
        setOpen(false);
        reset();
        setNotice("Lowongan berhasil dibuat.");
        setTimeout(() => setNotice(null), 3000);
        window.dispatchEvent(new Event("jobs-changed"));
        return;
      }
      const message = data.message ?? "Gagal membuat lowongan.";
      if (message === "Token tidak ditemukan" || message === "Token tidak valid atau sudah expired") {
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
    <>
      <button
        type="button"
        aria-label="Buat lowongan"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-3xl text-white shadow-lg transition-colors hover:bg-blue-500"
      >
        +
      </button>

      {notice && (
        <div
          role="status"
          className="fixed bottom-24 right-6 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg"
        >
          {notice}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="buat-lowongan-judul"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2
              id="buat-lowongan-judul"
              className="font-display text-xl font-semibold tracking-tight text-ink-900"
            >
              Buat Lowongan
            </h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div>
                <label htmlFor="cj-title" className="sr-only">
                  Judul lowongan
                </label>
                <input
                  id="cj-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-500 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                />
              </div>
              <div>
                <label htmlFor="cj-company" className="sr-only">
                  Nama perusahaan
                </label>
                <input
                  id="cj-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Perusahaan"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-500 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                />
              </div>
              <div>
                <label htmlFor="cj-location" className="sr-only">
                  Lokasi lowongan
                </label>
                <input
                  id="cj-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Lokasi"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-500 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                />
              </div>
              <div>
                <label htmlFor="cj-description" className="sr-only">
                  Deskripsi lowongan
                </label>
                <textarea
                  id="cj-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi"
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-500 focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                />
              </div>
              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Membuat Lowongan..." : "Buat Lowongan"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
