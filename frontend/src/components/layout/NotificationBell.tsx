"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiFetch } from "../../lib/api";
import { API_BASE_URL } from "../../lib/api";

type NotificationItem = {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message?: string | null;
  entity_type?: string | null;
  entity_id?: number | null;
  is_read: number;
  created_at: string;
  read_at?: string | null;
};

function getSocketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  return API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listResponse, countResponse] = await Promise.all([
        apiFetch<{ success: boolean; notifications?: NotificationItem[]; message?: string }>(
          "/notifications",
        ),
        apiFetch<{ success: boolean; unreadCount?: number; message?: string }>(
          "/notifications/unread-count",
        ),
      ]);

      if (listResponse.success) {
        setNotifications(listResponse.notifications ?? []);
      } else {
        setError(listResponse.message ?? "Gagal mengambil notifikasi.");
      }

      if (countResponse.success && typeof countResponse.unreadCount === "number") {
        setUnreadCount(countResponse.unreadCount);
      }
    } catch (err) {
      setError("Koneksi ke server gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const markOneRead = useCallback(async (id: number) => {
    try {
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/notifications/${id}/read`,
        { method: "PATCH" },
      );
      if (response.success) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, is_read: 1, read_at: new Date().toISOString() } : item,
          ),
        );
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } catch {
      setError("Gagal menandai notifikasi.");
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const response = await apiFetch<{ success: boolean; message?: string }>(
        "/notifications/read-all",
        { method: "PATCH" },
      );
      if (response.success) {
        setNotifications((prev) => prev.map((item) => ({ ...item, is_read: 1 })));
        setUnreadCount(0);
      }
    } catch {
      setError("Gagal menandai semua notifikasi.");
    }
  }, []);

  // Koneksi socket hanya dibuat satu kali selama komponen aktif.
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    const socket = io(getSocketUrl(), {
      auth: { token },
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const connect = () => {
      setConnected(true);
      void loadNotifications();
    };

    const disconnect = (reason: string) => {
      setConnected(false);
      if (reason !== "io client disconnect") {
        // Pesan koneksi singkat; sinkronisasi dilakukan saat reconnect.
      }
    };

    socket.on("reconnect", () => {
      void loadNotifications();
    });
    socket.on("disconnect", disconnect);
    socket.on("connect_error", (err) => {
      setConnected(false);
      setError(
        err.message === "Token tidak valid atau sudah expired"
          ? "Sesi notifikasi berakhir. Masuk ulang untuk memperbarui."
          : "Koneksi notifikasi gagal.",
      );
    });

    socket.connect();

    return () => {
      socket.off("connect", connect);
      socket.off("notification:new");
      socket.off("disconnect", disconnect);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [loadNotifications]);

  // Klik luar menutup panel.
  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Sinkronisasi ulang data saat panel dibuka setelah hilangnya fokus/reconnect.
  useEffect(() => {
    if (open && !loading) {
      void loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const togglePanel = () => setOpen((value) => !value);

  const formatTime = (value: string) => {
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const unreadBadge = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div ref={panelRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={togglePanel}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : "Notifikasi"}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 transition-colors duration-150 hover:bg-slate-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
          <path
            d="M6 9.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15C6 13.5 6 13.5 6 9.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M10 18.5a2 2 0 0 0 4 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
          >
            {unreadBadge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Daftar notifikasi"
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/8"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink-900">Notifikasi</p>
              <p className="text-xs text-ink-500">
                {connected ? "Terhubung" : "Terputus"} · {unreadCount} belum dibaca
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0 || loading}
              className="text-xs font-medium text-brand-600 transition-colors duration-150 hover:text-brand-700 disabled:cursor-not-allowed disabled:text-ink-400"
            >
              Tandai semua dibaca
            </button>
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-ink-500">Memuat notifikasi…</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-ink-500">Belum ada notifikasi.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map((item) => {
                  const unread = item.is_read === 0;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        disabled={!unread}
                        onClick={() => void markOneRead(item.id)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-slate-50 disabled:cursor-default"
                      >
                        <span
                          aria-hidden="true"
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${unread ? "bg-brand-600" : "bg-transparent"}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-ink-900">{item.title}</span>
                          {item.message && (
                            <span className="block text-xs leading-relaxed text-ink-500">
                              {item.message}
                            </span>
                          )}
                          <span className="mt-1 block text-[11px] text-ink-400">
                            {formatTime(item.created_at)}
                          </span>
                        </span>
                        {unread && (
                          <span className="shrink-0 rounded-full bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700 ring-1 ring-inset ring-brand-600/15">
                            Baru
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
