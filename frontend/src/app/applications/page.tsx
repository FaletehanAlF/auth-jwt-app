"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteMenu from "../../components/SiteMenu";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";
import SplitText from "../../components/SplitText";
import BorderGlow from "../../components/BorderGlow";
import { apiFetch } from "../../lib/api";
import type { Application } from "../../lib/types";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<{
          success: boolean;
          message?: string;
          applications?: Application[];
        }>("/applications/me");

        if (data.success && Array.isArray(data.applications)) {
          setApplications(data.applications);
        } else {
          const message = data.message ?? "Gagal mengambil lamaran.";
          if (
            message === "Token tidak ditemukan" ||
            message === "Token tidak valid atau sudah expired"
          ) {
            setError("Silakan login terlebih dahulu untuk melihat lamaran.");
          } else {
            setError(message);
          }
        }
      } catch {
        setError("Gagal mengambil lamaran.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip overscroll-none bg-neutral-950 text-white">
      <SiteMenu />
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-32 sm:px-6">
        <Reveal direction="right" delay={0}>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <SplitText text="Lamaran Saya" direction="right" charDelay={16} />
          </h1>
        </Reveal>

        {loading && (
          <p className="mt-6 text-sm text-white/60">Memuat lamaran...</p>
        )}

        {!loading && error && (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        )}

        {!loading && !error && applications.length === 0 && (
          <p className="mt-6 text-sm text-white/60">
            Kamu belum memiliki lamaran.
          </p>
        )}

        {!loading && !error && applications.length > 0 && (
          <Reveal direction="left" delay={120}>
            <div className="mt-6 grid grid-cols-1 gap-4">
              {applications.map((app) => (
                <BorderGlow
                  key={app.id}
                  borderRadius={12}
                  backgroundColor="#171717"
                  glowColor="217 91 60"
                  colors={["#3b82f6", "#60a5fa", "#818cf8"]}
                  className="px-5 py-5"
                >
                  <h2 className="font-display text-lg font-semibold text-white">
                    {app.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    {app.company} · {app.location}
                  </p>
                  {app.description && (
                    <p className="mt-3 text-sm leading-relaxed text-white/60">
                      {app.description}
                    </p>
                  )}
                  {app.created_at && (
                    <p className="mt-3 text-xs text-white/50">
                      Dilamar pada {new Date(app.created_at).toLocaleDateString("id-ID")}
                    </p>
                  )}
                  <Link
                    href={`/jobs/${app.job_id}`}
                    className="mt-4 inline-flex text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                  >
                    Lihat Lowongan
                  </Link>
                </BorderGlow>
              ))}
            </div>
          </Reveal>
        )}
      </main>
      <Footer />
    </div>
  );
}
