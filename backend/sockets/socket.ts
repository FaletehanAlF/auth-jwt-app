import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-jwt-project";

export type SocketUser = {
  id: number;
  email: string;
  role: "jobseeker" | "recruiter";
};

let ioInstance: Server | null = null;

export function initSocket(httpServer: HttpServer, allowedOrigins: string[]): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const authToken = socket.handshake.auth?.token;
    const authHeader = socket.handshake.headers.authorization;
    const headerToken =
      typeof authHeader === "string" ? authHeader.split(" ")[1] : undefined;
    const queryToken =
      typeof socket.handshake.query.token === "string"
        ? socket.handshake.query.token
        : undefined;

    const token = authToken || headerToken || queryToken;

    if (!token) {
      return next(new Error("Token tidak ditemukan"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as SocketUser;
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error("Token tidak valid atau sudah expired"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser;

    socket.join(`user:${user.id}`);

    console.log(
      `[socket] connected user=${user.id} role=${user.role} socket=${socket.id}`
    );

    socket.on("disconnect", (reason) => {
      console.log(
        `[socket] disconnected user=${user.id} socket=${socket.id} reason=${reason}`
      );
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error("Socket.IO belum diinisialisasi");
  }
  return ioInstance;
}

export function emitToUser(userId: number, event: string, payload: unknown): void {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}
