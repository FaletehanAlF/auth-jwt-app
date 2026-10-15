import type { Request, Response, NextFunction } from "express";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function cleanupBuckets(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

function rateLimit(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    cleanupBuckets(now);
    // req.ip sudah dinormalisasi Express; digabung path agar limit per-endpoint.
    const key = `${req.ip}:${req.path}`;
    const current = buckets.get(key);
    if (!current || now > current.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }
    if (current.count >= options.max) {
      return res.status(429).json({ success: false, message: options.message });
    }
    current.count += 1;
    return next();
  };
}

// 5x per 15 menit per IP: cukup untuk pemakaian wajar, menahan enumerasi/bruteforce.
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Terlalu banyak permintaan reset. Coba lagi nanti.",
});

// 10x per 15 menit per IP untuk percobaan token.
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Terlalu banyak percobaan. Coba lagi nanti.",
});
