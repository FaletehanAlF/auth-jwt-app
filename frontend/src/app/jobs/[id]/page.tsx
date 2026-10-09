"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SiteMenu from "../../../components/SiteMenu";
import Footer from "../../../components/Footer";
import Reveal from "../../../components/Reveal";
import SplitText from "../../../components/SplitText";
import { apiFetch } from "../../../lib/api";

type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  company: string;
};

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        } else {
          setJob(null);
          setError(data.message ?? "Lowongan tidak ditemukan.");
        }
      } catch {
        setError("Gagal mengambil detail lowongan.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip overscroll-none bg-neutral-950 text-white">
      <SiteMenu />
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-32 sm:px-6">
        <Link
          href="/lowongan"
          className="inline-flex text-sm text-blue-400 transition-colors hover:text-blue-300"
        >
          ← Kembali ke Lowongan
        </Link>

        {loading && (
          <p className="mt-6 text-sm text-white/60">
            Memuat detail lowongan...
          </p>
        )}

        {!loading && error && (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        )}

        {!loading && !error && !job && (
          <p className="mt-6 text-sm text-white/60">
            Lowongan tidak ditemukan.
          </p>
        )}

        {!loading && !error && job && (
          <Reveal direction="left" delay={0}>
            <article className="mt-6 rounded-lg border border-white/10 bg-neutral-900 px-6 py-8">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                <SplitText text={job.title} direction="left" charDelay={12} />
              </h1>
              <p className="mt-2 text-sm text-white/70">
                {job.company} · {job.location}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-white/60">
                {job.description}
              </p>

              <Link
                href="/lowongan"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-500"
              >
                Lihat Lowongan Tersedia
              </Link>
            </article>
          </Reveal>
        )}

        <Link
          href="/lowongan"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-medium text-neutral-900 transition-colors duration-150 hover:bg-slate-100"
        >
          Kembali ke Lowongan
        </Link>
      </main>
      <Footer />
    </div>
  );
}
