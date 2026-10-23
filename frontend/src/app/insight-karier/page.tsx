"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { io, type Socket } from "socket.io-client";
import AppShell from "../../components/layout/AppShell";
import RequireAuth from "../../components/auth/RequireAuth";
import { apiFetch } from "../../lib/api";
import { getStoredToken } from "../../lib/auth";
import type { InsightResponse, InsightRangeKey, InsightTrendPoint } from "../../lib/types";
import InsightTrendChart, { type TrendChartPoint } from "../../components/insight/InsightTrendChart";

const TOKEN_MESSAGES = [
  "Token tidak ditemukan",
  "Token tidak valid atau sudah expired",
  "Belum terautentikasi",
];

function isTokenMessage(message?: string): boolean {
  return !!message && TOKEN_MESSAGES.includes(message);
}

const RANGE_OPTIONS: { key: InsightRangeKey; label: string }[] = [
  { key: "7d", label: "7 hari" },
  { key: "30d", label: "30 hari" },
  { key: "90d", label: "90 hari" },
  { key: "all", label: "Semua waktu" },
];

type SocketStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

function getSocketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
  return apiBase.replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDayLabel(value: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(parseDateOnly(value));
  } catch {
    return value;
  }
}

function formatDayFull(value: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parseDateOnly(value));
  } catch {
    return value;
  }
}

function formatMonthLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  try {
    return new Intl.DateTimeFormat("id-ID", {
      month: "short",
      year: "numeric",
    }).format(new Date(year, month - 1, 1));
  } catch {
    return value;
  }
}

function formatMonthFull(value: string): string {
  const [year, month] = value.split("-").map(Number);
  try {
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, 1));
  } catch {
    return value;
  }
}

function formatGeneratedAt(value: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function buildTrendPoints(trend: InsightTrendPoint[]): TrendChartPoint[] {
  return trend.map((point) => {
    const isMonthly = point.date.length === 7;
    return {
      date: point.date,
      label: isMonthly ? formatMonthLabel(point.date) : formatDayLabel(point.date),
      fullLabel: isMonthly ? formatMonthFull(point.date) : formatDayFull(point.date),
      count: point.count,
    };
  });
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-ink-500">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Memuat statistik">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
        >
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="mt-4 h-9 w-16 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-20 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div
      className="animate-pulse rounded-xl bg-slate-100"
      role="status"
      aria-label="Memuat grafik"
      style={{ height: 288 }}
    />
  );
}

function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat daftar">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-slate-200/70 bg-white px-4 py-4"
        >
          <div className="h-4 w-2/3 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <p className="text-sm font-medium text-red-700">{message}</p>
      <div className="mt-4">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-ink-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  desc,
  href,
  actionLabel,
}: {
  title: string;
  desc: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
      <p className="font-display text-base font-semibold text-ink-900">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-500">{desc}</p>
      <Link
        href={href}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

export default function InsightKarierPage() {
  const [range, setRange] = useState<InsightRangeKey>("30d");
  const [data, setData] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>("connecting");

  const rangeRef = useRef<InsightRangeKey>(range);
  const socketRef = useRef<Socket | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasConnectedRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const fetchInsights = useCallback(async (targetRange: InsightRangeKey) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch<InsightResponse>(
        `/insights?range=${targetRange}&limit=5`,
      );

      if (requestId !== requestIdRef.current) return;

      if (response.success && response.summary) {
        setData(response);
      } else {
        const message = response.message ?? "Gagal mengambil insight karier.";
        if (isTokenMessage(message)) {
          setError("Sesi berakhir. Silakan masuk kembali.");
        } else {
          setError(message);
        }
      }
    } catch {
      if (requestId === requestIdRef.current) {
        setError("Gagal menghubungi server. Periksa koneksi lalu coba lagi.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchInsights(range);
  }, [range, attempt, fetchInsights]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setSocketStatus("disconnected");
      return;
    }

    const socket = io(getSocketUrl(), {
      auth: { token },
      autoConnect: false,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    let cancelled = false;

    const clearDebounce = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };

    const handleConnect = () => {
      if (cancelled) return;
      setSocketStatus("connected");

      if (hasConnectedRef.current) {
        void fetchInsights(rangeRef.current);
      }
      hasConnectedRef.current = true;
    };

    const handleDisconnect = () => {
      if (cancelled) return;
      setSocketStatus("reconnecting");
    };

    const handleConnectError = () => {
      if (cancelled) return;
      setSocketStatus("disconnected");
    };

    const handleInsightUpdated = () => {
      if (cancelled) return;
      clearDebounce();
      debounceRef.current = setTimeout(() => {
        void fetchInsights(rangeRef.current);
      }, 300);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("insight:updated", handleInsightUpdated);
    socket.connect();

    return () => {
      cancelled = true;
      clearDebounce();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("insight:updated", handleInsightUpdated);
      socket.disconnect();
      socketRef.current = null;
      setSocketStatus("disconnected");
    };
  }, [fetchInsights]);

  const trendPoints = useMemo(() => {
    if (!data) return [];
    return buildTrendPoints(data.trend);
  }, [data]);

  const hasTrendData = trendPoints.some((point) => point.count > 0);
  const trendPeriodLabel = range === "all" ? "bulan" : "hari";

  const handleRetry = () => {
    setData(null);
    setError(null);
    setLoading(true);
    setAttempt((value) => value + 1);
  };

  const handleRangeChange = (nextRange: InsightRangeKey) => {
    if (nextRange === range) return;
    setData(null);
    setError(null);
    setLoading(true);
    setRange(nextRange);
  };

  const socketStatusLabel =
    socketStatus === "connected"
      ? "Realtime aktif"
      : socketStatus === "reconnecting"
        ? "Menghubungkan ulang"
        : "Koneksi realtime terputus";

  const socketStatusClass =
    socketStatus === "connected"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
      : socketStatus === "reconnecting"
        ? "bg-amber-50 text-amber-700 ring-amber-600/15"
        : "bg-slate-100 text-slate-600 ring-slate-300";

  const socketDotClass =
    socketStatus === "connected"
      ? "bg-emerald-600"
      : socketStatus === "reconnecting"
        ? "bg-amber-600"
        : "bg-slate-400";

  return (
    <RequireAuth roles={["jobseeker"]}>
      <AppShell title="Insight Karier" subtitle="Statistik dan tren lamaran di JobTrack">
        <div className="space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                Insight Karier
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Statistik dan tren lamaran di JobTrack.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div
                role="tablist"
                aria-label="Filter periode"
                className="flex flex-wrap gap-2"
              >
                {RANGE_OPTIONS.map((option) => {
                  const active = range === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleRangeChange(option.key)}
                      className={`inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
                        active
                          ? "bg-brand-600 text-white"
                          : "border border-slate-200 bg-white text-ink-700 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${socketStatusClass}`}
                aria-live="polite"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${socketDotClass}`}
                />
                {socketStatusLabel}
              </span>
            </div>
          </header>

          {loading && !data ? (
            <>
              <SkeletonCards />
              <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 h-5 w-32 rounded bg-slate-100" />
                <SkeletonChart />
              </section>
              <SkeletonRows />
            </>
          ) : null}

          {error ? (
            <ErrorState message={error} onRetry={handleRetry} />
          ) : null}

          {!loading && !error && data ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Total lamaran"
                  value={String(data.summary.totalApplications)}
                  hint="Semua lamaran yang tersimpan"
                />
                <StatCard
                  label="Lowongan tersedia"
                  value={String(data.summary.availableJobs)}
                  hint="Baris lowongan pada database"
                />
                <StatCard
                  label="Perusahaan dengan lowongan"
                  value={String(data.summary.companiesWithJobs)}
                  hint="Nama perusahaan yang dinormalisasi"
                />
                <StatCard
                  label="Lamaran pada periode ini"
                  value={String(data.summary.applicationsInRange)}
                  hint={`${data.summary.unknownDateCount} lamaran tanpa tanggal`}
                />
              </div>

              <section
                aria-labelledby="trend-heading"
                className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h2
                    id="trend-heading"
                    className="font-display text-base font-semibold tracking-tight text-ink-900"
                  >
                    Tren Lamaran
                  </h2>
                  <p className="text-xs text-ink-500">
                    Jumlah lamaran per {trendPeriodLabel}
                  </p>
                </div>

                <div className="mt-4">
                  {hasTrendData ? (
                    <InsightTrendChart
                      points={trendPoints}
                      reducedMotion={reducedMotion}
                    />
                  ) : (
                    <EmptyState
                      title="Belum ada data lamaran"
                      desc="Lamaran yang masuk pada periode ini akan ditampilkan pada grafik."
                      href="/lowongan"
                      actionLabel="Cari Lowongan"
                    />
                  )}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section
                  aria-labelledby="companies-heading"
                  className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6"
                >
                  <h2
                    id="companies-heading"
                    className="font-display text-base font-semibold tracking-tight text-ink-900"
                  >
                    Perusahaan dengan Lamaran Terbanyak
                  </h2>

                  {data.topCompanies.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState
                        title="Belum ada perusahaan"
                        desc="Perusahaan akan muncul setelah ada lamaran yang masuk."
                        href="/lowongan"
                        actionLabel="Cari Lowongan"
                      />
                    </div>
                  ) : (
                    <ul className="mt-4 space-y-4" role="list">
                      {data.topCompanies.map((company, index) => {
                        const maxCount = data.topCompanies[0]?.applicationCount || 1;
                        const width = Math.round(
                          (company.applicationCount / maxCount) * 100,
                        );

                        return (
                          <li key={`${company.company}-${index}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-ink-900">
                                  {index + 1}. {company.company}
                                </p>
                                <p className="mt-0.5 text-xs text-ink-500">
                                  {company.applicationCount} lamaran · {company.jobCount} lowongan
                                </p>
                              </div>
                            </div>
                            <div
                              className="mt-2 h-2 rounded-full bg-slate-100"
                              role="presentation"
                            >
                              <div
                                className="h-2 rounded-full bg-brand-600 transition-[width] duration-500 ease-out"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section
                  aria-labelledby="positions-heading"
                  className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6"
                >
                  <h2
                    id="positions-heading"
                    className="font-display text-base font-semibold tracking-tight text-ink-900"
                  >
                    Posisi Populer
                  </h2>
                  <p className="mt-1 text-xs text-ink-500">
                    Dihitung berdasarkan judul lowongan, bukan kategori industri.
                  </p>

                  {data.popularPositions.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState
                        title="Belum ada posisi populer"
                        desc="Posisi akan muncul setelah ada lamaran yang masuk."
                        href="/lowongan"
                        actionLabel="Cari Lowongan"
                      />
                    </div>
                  ) : (
                    <ul className="mt-4 divide-y divide-slate-100" role="list">
                      {data.popularPositions.map((position, index) => (
                        <li key={`${position.title}-${index}`} className="flex items-center justify-between gap-3 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink-900">
                              {position.title}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-500">
                              {position.applicationCount} lamaran · {position.jobCount} lowongan
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-600/15">
                            #{index + 1}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              <section
                aria-labelledby="jobs-heading"
                className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2
                  id="jobs-heading"
                  className="font-display text-base font-semibold tracking-tight text-ink-900"
                >
                  Lowongan yang Diminati
                </h2>

                {data.inDemandJobs.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState
                      title="Belum ada lowongan diminati"
                      desc="Lowongan dengan lamaran terbanyak akan ditampilkan di sini."
                      href="/lowongan"
                      actionLabel="Cari Lowongan"
                    />
                  </div>
                ) : (
                  <ul className="mt-4 divide-y divide-slate-100" role="list">
                    {data.inDemandJobs.map((job) => (
                      <li key={job.jobId} className="py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <Link
                              href={`/jobs/${job.jobId}`}
                              className="text-sm font-medium text-ink-900 transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                            >
                              {job.title}
                            </Link>
                            <p className="mt-0.5 truncate text-xs text-ink-500">
                              {job.company} · {job.location}
                            </p>
                            <p className="mt-1 text-xs text-ink-500">
                              {job.applicationCount} lamaran total · {job.recentApplicationCount} pada periode ini
                            </p>
                          </div>
                          <Link
                            href={`/jobs/${job.jobId}`}
                            className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                          >
                            Lihat detail
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <p className="text-xs text-ink-500">
                Data diperbarui {formatGeneratedAt(data.generatedAt)}.
              </p>
            </>
          ) : null}

          {!loading && !error && !data ? (
            <EmptyState
              title="Belum ada data insight"
              desc="Insight akan muncul setelah data lamaran tersedia."
              href="/lowongan"
              actionLabel="Cari Lowongan"
            />
          ) : null}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
