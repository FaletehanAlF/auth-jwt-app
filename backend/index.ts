import "dotenv/config";
import { createServer } from "http";
import app from "./app";
import { initSocket } from "./sockets/socket";
import { ALLOWED_ORIGINS } from "./config/config";

/**
 * Entry point server JobTrack.
 *
 * Konfigurasi HTTP (CORS, body parser, error handler, routing, 404) berada
 * di `app.ts` supaya bisa diuji tanpa membuka port. File ini hanya
 * menjalankan server + Socket.IO.
 */

const PORT = Number(process.env.PORT) || 5001;

const httpServer = createServer(app);
initSocket(httpServer, ALLOWED_ORIGINS);

httpServer.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
