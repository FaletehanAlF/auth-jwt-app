"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

function isRecruiter(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "recruiter";
  } catch {
    return false;
  }
}

export default function CreateJobWidget() {
  const [allowed, setAllowed] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setAllowed(isRecruiter());
  }, []);

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
        <div className="fixed bottom-24 right-6 z-50 rounded-lg bg-green-600 px-4 py-3 text-sm text-white shadow-lg">
          {notice}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-neutral-900 p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl font-semibold">Buat Lowongan</h2>
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul"
                className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Perusahaan"
                className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lokasi"
                className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi"
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-neutral-950 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Membuat Lowongan..." : "Buat Lowongan"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 px-4 text-sm text-white/70 hover:text-white"
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
