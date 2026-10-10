"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell from "../../../../../components/AppShell";
import RequireAuth from "../../../../../components/RequireAuth";
import { apiFetch } from "../../../../../lib/api";
import type { Applicant } from "../../../../../lib/types";

export default function ApplicantsPage() {
  const params = useParams();
  const id = params?.id;

  const [applications, setApplications] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<{
          success: boolean;
          message?: string;
          applications?: Applicant[];
        }>(`/jobs/${id}/applications`);

        if (data.success && Array.isArray(data.applications)) {
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
        setError("Gagal mengambil data pelamar. Coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplicants();
    }
  }, [id]);

  return (
    <RequireAuth roles={["recruiter"]}>
    <AppShell title="Pelamar Lowongan" subtitle="Daftar pelamar untuk lowongan ini">
      <div className="rounded-2xl bg-neutral-950 p-6 text-white sm:p-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Pelamar Lowongan
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
          <p className="mt-6 text-sm text-white/60">Memuat pelamar...</p>
        )}

        {!loading && error && (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        )}

        {!loading && !error && applications.length === 0 && (
          <p className="mt-6 text-sm text-white/60">
            Belum ada pelamar untuk lowongan ini.
          </p>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-lg border border-white/10 bg-neutral-900 px-5 py-5"
              >
                <h2 className="font-display text-lg font-semibold text-white">
                  {app.name ?? app.jobseeker_name ?? "Tanpa nama"}
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  {app.email ?? app.jobseeker_email ?? "-"}
                </p>
                {app.created_at && (
                  <p className="mt-3 text-xs text-white/50">
                    Melamar pada{" "}
                    {new Date(app.created_at).toLocaleDateString("id-ID")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <Link
          href="/recruiter/jobs"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-medium text-neutral-900 transition-colors duration-150 hover:bg-slate-100"
        >
          Kembali ke Lowongan Saya
        </Link>
      </div>
    </AppShell>
    </RequireAuth>
  );
}
