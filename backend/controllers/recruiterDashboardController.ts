import type { Request, Response } from "express";

import db from "../config/database";
import { APPLICATION_STATUSES } from "./applicationController";

/**
 * Dashboard recruiter - ringkasan lowongan milik recruiter yang sedang
 * login beserta pelamarnya.
 *
 * Scoping: SELURUH query dibatasi `j.recruiter_id = ?` dengan `?` diambil
 * dari `req.user.id` (JWT). `recruiter_id` tidak pernah diterima dari
 * client, jadi recruiter A tidak mungkin melihat lowongan maupun pelamar
 * milik recruiter B. Pola ini sama dengan `getMyJobs` di jobController.
 *
 * Bentuk respons mengikuti pola endpoint yang sudah ada:
 * - `GET /api/recruiter/jobs`  -> { success, jobs[] }
 * - `GET /api/insights`        -> { success, message, generatedAt, summary, ... }
 *
 * Angka-angka di bawah berasal dari data yang benar-benar ada:
 * - `totalJobs`       : jumlah lowongan milik recruiter (dari tabel `jobs`)
 * - `totalApplications`: jumlah lamaran atas lowongan miliknya
 * - `recentApplications`: lamaran yang `created_at`-nya berada di antara
 *   NOW() - 7 hari dan NOW() (inklusif kedua batas) - definisi yang sama
 *   dengan `isWithinDays(created_at, 7)` di frontend
 *   (frontend/src/app/home/page.tsx:54-60).
 * - `unknownDateCount`: lamaran tanpa `created_at` (kolomnya NULLable).
 * - `statusBreakdown` : 5 status dari ENUM `applications.status`
 *   (migrasi 001) - daftar yang sama dipakai applicationController.
 */

/** Jendela "pelamar terbaru" dalam hari. */
export const RECENT_APPLICATION_DAYS = 7;

/**
 * Predikat SQL untuk lamaran yang masuk jendela "pelamar terbaru".
 *
 * `created_at` harus berada di antara NOW() - 7 HARI dan NOW(), **inklusif
 * di kedua batas**. Ini sepadan dengan `isWithinDays(created_at, 7)` di
 * frontend (frontend/src/app/home/page.tsx:54-60):
 *
 *   diff = Date.now() - t; return diff >= 0 && diff <= 7 hari
 *   -> t <= now  DAN  t >= now - 7 hari
 *
 * Batas atas `created_at <= NOW()` WAJIB ada: tanpanya, lamaran yang
 * `created_at`-nya di masa depan ikut terhitung "terbaru" di backend,
 * padahal frontend mengecualikannya.
 *
 * Diekspor supaya definisinya punya satu sumber dan bisa dikunci test.
 */
export const RECENT_APPLICATION_WINDOW_SQL =
  `a.created_at IS NOT NULL` +
  ` AND a.created_at >= DATE_SUB(NOW(), INTERVAL ${RECENT_APPLICATION_DAYS} DAY)` +
  ` AND a.created_at <= NOW()`;

/**
 * Query total lamaran milik recruiter: lamaran dalam jendela 7 hari +
 * lamaran tanpa `created_at` (dihitung terpisah sebagai unknownDateCount).
 * Diekspor supaya pemesian jendela di atas benar-benar terpakai di query.
 */
export const RECRUITER_TOTALS_QUERY = `SELECT
         SUM(CASE WHEN ${RECENT_APPLICATION_WINDOW_SQL} THEN 1 ELSE 0 END) AS recentCount,
         SUM(CASE WHEN a.created_at IS NULL THEN 1 ELSE 0 END) AS unknownDateCount
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE j.recruiter_id = ?`;

type StatusKey = (typeof APPLICATION_STATUSES)[number];

export type RecruiterDashboardStatusCounts = {
  [K in StatusKey]: number;
};

/**
 * Baris hasil agregasi per lowongan.
 * `COUNT` mengembalikan number, tetapi `SUM` mengembalikan DECIMAL yang
 * mysql2 default-nya dikembalikan sebagai string - keduanya dinormalisasi
 * ke number lewat `Number()`.
 */
export type RecruiterDashboardJobRow = {
  id: number;
  title: string;
  company: string;
  location: string;
  created_at: string | Date;
  applicationCount: number | string;
} & {
  [K in StatusKey]: number | string;
};

export type RecruiterDashboardTotalsRow = {
  recentCount?: number | string | null;
  unknownDateCount?: number | string | null;
};

export type RecruiterDashboardJob = {
  id: number;
  title: string;
  company: string;
  location: string;
  created_at: string;
  applicationCount: number;
  statusBreakdown: RecruiterDashboardStatusCounts;
};

export type RecruiterDashboardResponse = {
  success: true;
  message: string;
  generatedAt: string;
  summary: {
    totalJobs: number;
    totalApplications: number;
    recentApplications: number;
    unknownDateCount: number;
  };
  statusBreakdown: RecruiterDashboardStatusCounts;
  jobs: RecruiterDashboardJob[];
};

/** Breakdown status kosong - semua status dari enum, bernilai 0. */
export function emptyStatusCounts(): RecruiterDashboardStatusCounts {
  const counts = {} as RecruiterDashboardStatusCounts;
  for (const status of APPLICATION_STATUSES) {
    counts[status] = 0;
  }
  return counts;
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value ?? "");
}

/**
 * Pemetaan baris SQL -> bentuk respons. Fungsi murni (tanpa I/O) supaya
 * bentuk respons dan perhitungan agregatnya bisa diuji tanpa database.
 */
export function buildRecruiterDashboard(
  jobRows: RecruiterDashboardJobRow[],
  totals: RecruiterDashboardTotalsRow
): RecruiterDashboardResponse {
  const jobs: RecruiterDashboardJob[] = jobRows.map((row) => {
    const statusBreakdown = emptyStatusCounts();
    for (const status of APPLICATION_STATUSES) {
      statusBreakdown[status] = toNumber(row[status]);
    }
    return {
      id: toNumber(row.id),
      title: String(row.title ?? ""),
      company: String(row.company ?? ""),
      location: String(row.location ?? ""),
      created_at: toIsoString(row.created_at),
      applicationCount: toNumber(row.applicationCount),
      statusBreakdown,
    };
  });

  const statusBreakdown = emptyStatusCounts();
  let totalApplications = 0;
  for (const job of jobs) {
    totalApplications += job.applicationCount;
    for (const status of APPLICATION_STATUSES) {
      statusBreakdown[status] += job.statusBreakdown[status];
    }
  }

  return {
    success: true,
    message: "Berhasil mengambil dashboard recruiter",
    generatedAt: new Date().toISOString(),
    summary: {
      totalJobs: jobs.length,
      totalApplications,
      recentApplications: toNumber(totals.recentCount),
      unknownDateCount: toNumber(totals.unknownDateCount),
    },
    statusBreakdown,
    jobs,
  };
}

export const getRecruiterDashboard = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.user!.id;

    // Lowongan milik recruiter + jumlah pelamar + sebaran status.
    // LEFT JOIN supaya lowongan tanpa pelamar tetap muncul (count 0).
    const [jobRows] = await db.execute(
      `SELECT j.id AS id, j.title AS title, j.company AS company, j.location AS location,
              j.created_at AS created_at,
              COUNT(a.id) AS applicationCount,
              SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pending,
              SUM(CASE WHEN a.status = 'reviewed' THEN 1 ELSE 0 END) AS reviewed,
              SUM(CASE WHEN a.status = 'interview' THEN 1 ELSE 0 END) AS interview,
              SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END) AS accepted,
              SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected
       FROM jobs j
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.recruiter_id = ?
       GROUP BY j.id, j.title, j.company, j.location, j.created_at
       ORDER BY j.created_at DESC`,
      [recruiterId]
    );

    // Lamaran 7 hari terakhir + lamaran tanpa tanggal.
    // Jendelanya (batas bawah DAN batas atas) didefinisikan sekali di
    // RECENT_APPLICATION_WINDOW_SQL.
    const [totalsRows] = await db.execute(RECRUITER_TOTALS_QUERY, [recruiterId]);

    const totals = ((totalsRows as any[])[0] ?? {}) as RecruiterDashboardTotalsRow;

    return res.status(200).json(
      buildRecruiterDashboard(jobRows as RecruiterDashboardJobRow[], totals)
    );
  } catch (error) {
    console.error("GET /api/recruiter/dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
