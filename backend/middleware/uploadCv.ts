import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";
import { CV_DIR } from "../config/config";

export const CV_FIELD = "cv";
export const MAX_CV_BYTES = 5 * 1024 * 1024;
const CV_MIME = "application/pdf";

// Folder privat di luar repo (absolut dari config, tanpa cwd).
// Dibuat sekali saat modul dimuat agar upload gagal cepat jika tidak writable.
fs.mkdirSync(CV_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CV_DIR);
  },
  filename: (_req, _file, cb) => {
    // Nama acak, ekstensi tetap .pdf — tanpa input user (anti traversal).
    cb(null, `${crypto.randomUUID()}.pdf`);
  },
});

function cvFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".pdf" || file.mimetype !== CV_MIME) {
    cb(new Error("CV harus berformat PDF."));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_CV_BYTES, files: 1 },
  fileFilter: cvFileFilter,
});

// Wrapper agar semua error upload konsisten { success: false, message }.
export const uploadCvSingle = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single(CV_FIELD)(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({
          success: false,
          message: "Ukuran CV maksimal 5 MB.",
        });
        return;
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        res.status(400).json({
          success: false,
          message: "Field CV harus bernama 'cv'.",
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: "Gagal mengunggah CV.",
      });
      return;
    }
    if (err instanceof Error && err.message === "CV harus berformat PDF.") {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    res.status(400).json({
      success: false,
      message: "Gagal mengunggah CV.",
    });
  });
};
