export type UserRole = "jobseeker" | "recruiter";

/**
 * Token disimpan di salah satu dari dua storage, tergantung pilihan
 * "Ingat saya" saat login:
 *   - localStorage    → sesi bertahan setelah tab/browser ditutup
 *   - sessionStorage  → sesi hilang saat tab ditutup
 *
 * Semua pembacaan WAJIB lewat getStoredToken()/getStoredItem(), dan semua
 * penulisan lewat setStoredToken()/setStoredItem()/removeStoredAuth().
 * Membaca localStorage langsung akan melewatkan sesi yang tersimpan di
 * sessionStorage — pengguna akan tampak logout padahal masih login.
 */
export const AUTH_STORAGE_KEYS = ["token", "user_name"] as const;
export type AuthStorageKey = (typeof AUTH_STORAGE_KEYS)[number];

/** Storage tempat token aktif berada, atau null kalau belum login. */
export function getAuthStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    if (window.localStorage.getItem("token")) return window.localStorage;
    if (window.sessionStorage.getItem("token")) return window.sessionStorage;
  } catch {
    // Storage bisa diblokir (mode privat / kebijakan browser). Anggap belum login.
    return null;
  }
  return null;
}

export function getStoredToken(): string | null {
  return getAuthStorage()?.getItem("token") ?? null;
}

/** Ambil nilai dari storage yang sedang aktif (bukan selalu localStorage). */
export function getStoredItem(key: AuthStorageKey): string | null {
  return getAuthStorage()?.getItem(key) ?? null;
}

/**
 * Simpan sesi. `remember` menentukan umur sesi:
 *   true  → localStorage (bertahan)
 *   false → sessionStorage (hilang saat tab ditutup)
 *
 * Kedua storage dibersihkan dulu supaya tidak ada token yatim di storage
 * lain yang menang pada pembacaan berikutnya.
 */
export function setStoredAuth(
  token: string,
  userName: string | null,
  remember: boolean,
): void {
  if (typeof window === "undefined") return;
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  try {
    for (const key of AUTH_STORAGE_KEYS) {
      other.removeItem(key);
    }
    target.setItem("token", token);
    if (userName) target.setItem("user_name", userName);
  } catch {
    // Storage penuh/diblokir: login tetap berhasil di sisi server, tapi sesi
    // tidak tersimpan. Pemanggil tetap diarahkan ke beranda; RequireAuth
    // akan mengembalikan ke /login kalau token memang tidak ada.
  }
}

export function removeStoredAuth(): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of AUTH_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Tidak ada yang bisa dilakukan; pemanggil sudah mengarahkan ke /login.
  }
}

export function getRoleFromToken(): UserRole | null {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "recruiter" ? "recruiter" : "jobseeker";
  } catch {
    return null;
  }
}

export function isRecruiter(): boolean {
  return getRoleFromToken() === "recruiter";
}

export function getEmailFromToken(): string | null {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}

export type TokenPayload = {
  id: number;
  email: string | null;
  role: UserRole;
  exp?: number;
};

export function getTokenPayload(): TokenPayload | null {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1])) as {
      id?: unknown;
      email?: unknown;
      role?: unknown;
      exp?: unknown;
    };
    if (typeof payload.id !== "number" && typeof payload.id !== "string") {
      return null;
    }
    return {
      id: Number(payload.id),
      email: typeof payload.email === "string" ? payload.email : null,
      role: payload.role === "recruiter" ? "recruiter" : "jobseeker",
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

export function isPayloadExpired(payload: TokenPayload): boolean {
  return payload.exp !== undefined && payload.exp * 1000 <= Date.now();
}
