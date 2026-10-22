import "dotenv/config";
import path from "path";

// Default penyimpanan CV lokal (di luar repository).
const DEFAULT_CV_DIR = "C:\\JobTrackPrivate\\cv";

function getCvDir(): string {
  const configured = (process.env.CV_DIR ?? "").trim() || DEFAULT_CV_DIR;
  if (!path.isAbsolute(configured)) {
    throw new Error(
      "CV_DIR harus berupa absolute path. Cek backend/.env.example"
    );
  }
  return path.normalize(configured);
}

export const CV_DIR = getCvDir();

/**
 * Origin yang diizinkan untuk CORS (Express) dan Socket.IO.
 * Nilai & kebijakannya tidak berubah - hanya dipindah ke satu sumber
 * supaya app.ts (CORS) dan index.ts (Socket.IO) memakai konfigurasi yang sama.
 */
export const ALLOWED_ORIGINS = (
  process.env.FRONTEND_URL || "http://localhost:5000,http://10.2.12.75:5000"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
