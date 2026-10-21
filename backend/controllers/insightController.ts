import type { Request, Response } from "express";

import db from "../config/database";

type RangeKey = "7d" | "30d" | "90d" | "all";

const VALID_RANGES: RangeKey[] = ["7d", "30d", "90d", "all"];
const DEFAULT_RANGE: RangeKey = "30d";
const DEFAULT_LIMIT = 5;
const MIN_LIMIT = 1;
const MAX_LIMIT = 10;

function isValidRange(value: unknown): value is RangeKey {
  return typeof value === "string" && (VALID_RANGES as string[]).includes(value);
}

function parseLimit(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return DEFAULT_LIMIT;
  if (typeof value !== "string") return null;
  if (!/^-?\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < MIN_LIMIT || parsed > MAX_LIMIT) {
    return null;
  }
  return parsed;
}

function toUtcDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const date = toUtcDate(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return formatUtcDate(date);
}

function addMonths(monthStr: string, months: number): string {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  return date.toISOString().slice(0, 7);
}

function monthRange(startMonth: string, endMonth: string): string[] {
  const result: string[] = [];
  let current = startMonth;
  while (current <= endMonth) {
    result.push(current);
    const next = addMonths(current, 1);
    if (next === current) break;
    current = next;
  }
  return result;
}

export const getInsights = async (req: Request, res: Response) => {
  try {
    const rangeParam = req.query.range;
    let range: RangeKey | null = null;

    if (rangeParam === undefined) {
      range = DEFAULT_RANGE;
    } else if (isValidRange(rangeParam)) {
      range = rangeParam;
    }

    if (!range) {
      return res.status(400).json({
        success: false,
        message: "Parameter range tidak valid. Nilai yang diterima: 7d, 30d, 90d, all.",
      });
    }

    const limit = parseLimit(req.query.limit);
    if (limit === null) {
      return res.status(400).json({
        success: false,
        message: `Parameter limit tidak valid. Gunakan bilangan bulat antara ${MIN_LIMIT} dan ${MAX_LIMIT}.`,
      });
    }

    const [todayRows] = await db.execute(
      "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today"
    );
    const today = (todayRows as any[])[0]?.today as string;

    const daysByRange: Record<Exclude<RangeKey, "all">, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };

    let start: string | null = null;
    let endExclusive: string | null = null;
    let days = 0;

    if (range !== "all") {
      days = daysByRange[range];
      start = addDays(today, -(days - 1));
      endExclusive = addDays(today, 1);
    }

    // Ringkasan
    const [totalRows] = await db.execute("SELECT COUNT(*) AS n FROM applications");
    const totalApplications = Number((totalRows as any[])[0]?.n ?? 0);

    const [jobRows] = await db.execute("SELECT COUNT(*) AS n FROM jobs");
    const availableJobs = Number((jobRows as any[])[0]?.n ?? 0);

    const [companyRows] = await db.execute(
      "SELECT COUNT(DISTINCT LOWER(TRIM(company))) AS n FROM jobs"
    );
    const companiesWithJobs = Number((companyRows as any[])[0]?.n ?? 0);

    const [unknownDateRows] = await db.execute(
      "SELECT COUNT(*) AS n FROM applications WHERE created_at IS NULL"
    );
    const unknownDateCount = Number((unknownDateRows as any[])[0]?.n ?? 0);

    let applicationsInRange = 0;
    if (range === "all") {
      const [inRangeRows] = await db.execute(
        "SELECT COUNT(*) AS n FROM applications WHERE created_at IS NOT NULL"
      );
      applicationsInRange = Number((inRangeRows as any[])[0]?.n ?? 0);
    } else {
      const [inRangeRows] = await db.execute(
        "SELECT COUNT(*) AS n FROM applications WHERE created_at IS NOT NULL AND created_at >= ? AND created_at < ?",
        [start, endExclusive]
      );
      applicationsInRange = Number((inRangeRows as any[])[0]?.n ?? 0);
    }

    // Tren
    let trend: Array<{ date: string; count: number }> = [];

    if (range !== "all" && start && endExclusive) {
      const [trendRows] = await db.execute(
        "SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS n FROM applications WHERE created_at IS NOT NULL AND created_at >= ? AND created_at < ? GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') ORDER BY d",
        [start, endExclusive]
      );
      const trendMap = new Map<string, number>();
      (trendRows as any[]).forEach((row) => {
        trendMap.set(String(row.d), Number(row.n));
      });
      for (let i = 0; i < days; i += 1) {
        const date = addDays(start, i);
        trend.push({ date, count: trendMap.get(date) ?? 0 });
      }
    } else {
      const [monthlyRows] = await db.execute(
        "SELECT DATE_FORMAT(created_at, '%Y-%m') AS m, COUNT(*) AS n FROM applications WHERE created_at IS NOT NULL GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY m"
      );
      const monthlyMap = new Map<string, number>();
      (monthlyRows as any[]).forEach((row) => {
        monthlyMap.set(String(row.m), Number(row.n));
      });
      if (monthlyMap.size > 0) {
        const firstMonth = [...monthlyMap.keys()][0];
        const currentMonth = today.slice(0, 7);
        const months = monthRange(firstMonth, currentMonth);
        trend = months.map((month) => ({
          date: month,
          count: monthlyMap.get(month) ?? 0,
        }));
      }
    }

    // Top companies
    const [topCompanyRows] = await db.execute(
      "SELECT MIN(company) AS company, COUNT(a.id) AS applicationCount, COUNT(DISTINCT j.id) AS jobCount FROM jobs j LEFT JOIN applications a ON a.job_id = j.id GROUP BY LOWER(TRIM(j.company)) HAVING COUNT(a.id) >= 1 ORDER BY applicationCount DESC, jobCount DESC, LOWER(TRIM(j.company)) ASC LIMIT ?",
      [limit]
    );
    const topCompanies = (topCompanyRows as any[]).map((row) => ({
      company: String(row.company ?? ""),
      applicationCount: Number(row.applicationCount ?? 0),
      jobCount: Number(row.jobCount ?? 0),
    }));

    // In-demand jobs
    const inDemandParams: any[] = [];
    let inDemandSql =
      "SELECT j.id AS jobId, j.title AS title, j.company AS company, j.location AS location, COUNT(a.id) AS applicationCount";

    if (range === "all") {
      inDemandSql +=
        ", SUM(CASE WHEN a.created_at IS NOT NULL THEN 1 ELSE 0 END) AS recentApplicationCount";
    } else {
      inDemandSql +=
        ", SUM(CASE WHEN a.created_at IS NOT NULL AND a.created_at >= ? AND a.created_at < ? THEN 1 ELSE 0 END) AS recentApplicationCount";
      inDemandParams.push(start, endExclusive);
    }

    inDemandSql +=
      " FROM jobs j LEFT JOIN applications a ON a.job_id = j.id GROUP BY j.id, j.title, j.company, j.location HAVING COUNT(a.id) >= 1 ORDER BY applicationCount DESC, j.created_at DESC LIMIT ?";
    inDemandParams.push(limit);

    const [inDemandRows] = await db.execute(inDemandSql, inDemandParams);
    const inDemandJobs = (inDemandRows as any[]).map((row) => ({
      jobId: Number(row.jobId),
      title: String(row.title ?? ""),
      company: String(row.company ?? ""),
      location: String(row.location ?? ""),
      applicationCount: Number(row.applicationCount ?? 0),
      recentApplicationCount: Number(row.recentApplicationCount ?? 0),
    }));

    // Popular positions (proxy by job title, not industry category)
    const [positionRows] = await db.execute(
      "SELECT j.title AS title, COUNT(a.id) AS applicationCount, COUNT(DISTINCT j.id) AS jobCount FROM jobs j LEFT JOIN applications a ON a.job_id = j.id GROUP BY j.title HAVING COUNT(a.id) >= 1 ORDER BY applicationCount DESC, jobCount DESC, j.title ASC LIMIT ?",
      [limit]
    );
    const popularPositions = (positionRows as any[]).map((row) => ({
      title: String(row.title ?? ""),
      applicationCount: Number(row.applicationCount ?? 0),
      jobCount: Number(row.jobCount ?? 0),
    }));

    // Batas tanggal respons
    let responseStart: string | null = null;
    const responseEnd: string = today;

    if (range === "all") {
      const [minRows] = await db.execute(
        "SELECT DATE_FORMAT(MIN(created_at), '%Y-%m-%d') AS firstDate FROM applications WHERE created_at IS NOT NULL"
      );
      responseStart = (minRows as any[])[0]?.firstDate
        ? String((minRows as any[])[0].firstDate)
        : null;
    } else {
      responseStart = start;
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil insight karier",
      generatedAt: new Date().toISOString(),
      range: {
        key: range,
        start: responseStart,
        end: responseEnd,
      },
      summary: {
        totalApplications,
        availableJobs,
        companiesWithJobs,
        applicationsInRange,
        unknownDateCount,
      },
      trend,
      topCompanies,
      inDemandJobs,
      popularPositions,
    });
  } catch (error) {
    console.error("GET /insights error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
