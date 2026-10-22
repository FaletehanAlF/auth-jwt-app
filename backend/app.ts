import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";
import { ALLOWED_ORIGINS } from "./config/config";

/**
 * Instance Express JobTrack.
 *
 * Dipisah dari `index.ts` (entry point server) supaya instance app bisa
 * dipakai pengujian tanpa membuka port: pengujian memakai `listen(0)`
 * (port ephemeral) lalu menutupnya, bukan `listen(5001)` seperti produksi.
 *
 * PERINGATAN - URUTAN MIDDLEWARE MEMBEKAN KONTRAK:
 * 1. cors
 * 2. express.json()
 * 3. error handler JSON malformed
 * 4. health check GET /
 * 5. mount /api
 * 6. fallback 404
 *
 * Handler pada (3) HANYA menangkap error yang dilempar `express.json()`
 * itu sendiri, karena ia terdaftar setelah (2) dan sebelum router. Kalau
 * urutannya diubah, JSON malformed akan berubah dari 400 "Body JSON tidak
 * valid" menjadi 500. Jangan menukar posisi ini tanpa memperbarui
 * `backend/tests/errorContract.test.ts`.
 */
const app = express();

// 1. CORS
app.use(cors({ origin: ALLOWED_ORIGINS }));

// 2. Body parser JSON
app.use(express.json());

// 3. Error handler untuk JSON malformed.
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
      return res.status(400).json({
        success: false,
        message: "Body JSON tidak valid",
      });
    }
    next(err);
  }
);

// 4. Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend Express + MySQL berjalan!",
  });
});

// 5. API
app.use("/api", routes);

// 6. Fallback 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

export default app;
