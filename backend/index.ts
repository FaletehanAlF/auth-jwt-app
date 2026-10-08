import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();

const PORT = Number(process.env.PORT) || 5001;

const ALLOWED_ORIGINS = (
  process.env.FRONTEND_URL || "http://localhost:5000,http://10.2.12.75:5000"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ success: false, message: "Body JSON tidak valid" });
  }
  next(err);
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend Express + MySQL berjalan!",
  });
});

app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});