"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteMenu from "../../components/SiteMenu";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";
import SplitText from "../../components/SplitText";
import BorderGlow from "../../components/BorderGlow";
import { apiFetch } from "../../lib/api";
import type { Job } from "../../lib/types";

export default function LowonganPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);
        const data = await apiFetch<{ success: boolean; message?: string; jobs?: Job[] }>("/jobs");
        if (data.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        } else if (
          data.message === "Token tidak ditemukan" ||
          data.message === "Token tidak valid atau sudah expired"
        ) {
          setError("Silakan login terlebih dahulu untuk melihat lowongan.");
        } else {
          setError("Gagal mengambil data lowongan.");
        }
      } catch {
        setError("Gagal mengambil data lowongan.");
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
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip overscroll-none bg-neutral-950 text-white">
      <SiteMenu />
      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-32 sm:px-6">
        <Reveal direction="left" delay={0}>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <SplitText
              text="Lowongan Tersedia"
              direction="left"
              charDelay={14}
            />
          </h1>
        </Reveal>
        {loading && (
          <p className="mt-6 text-sm text-white/60">Memuat lowongan...</p>
        )}
        {error && !loading && (
          <div className="mt-6">
            <p className="text-sm text-red-400">{error}</p>
            {error.startsWith("Silakan login") && (
              <Link
                href="/login"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-500"
              >
                Masuk ke Akun
              </Link>
            )}
          </div>
        )}
        {!loading && !error && jobs.length === 0 && (
          <p className="mt-6 text-sm text-white/60">
            Belum ada lowongan saat ini.
          </p>
        )}
        {!loading && !error && jobs.length > 0 && (
          <Reveal direction="right" delay={120}>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {jobs.map((job) => (
                <BorderGlow
                  key={job.id}
                  borderRadius={12}
                  backgroundColor="#171717"
                  glowColor="217 91 60"
                  colors={["#3b82f6", "#60a5fa", "#818cf8"]}
                  className="px-5 py-5"
                >
                  <h3 className="font-display text-lg font-semibold text-white">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    {job.company} · {job.location}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {job.description}
                  </p>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="mt-4 inline-flex text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                  >
                    Lihat Detail
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
