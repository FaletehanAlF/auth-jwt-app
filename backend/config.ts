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
