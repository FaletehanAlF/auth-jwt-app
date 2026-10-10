export type UserRole = "jobseeker" | "recruiter";

/**
 * Membaca role dari JWT di localStorage ("token") tanpa verifikasi
 * signature — hanya untuk gating UI. Otorisasi sesungguhnya tetap di
 * backend (verifyToken + authorize).
 *
 * Perilaku disamakan dengan implementasi asal di SiteMenu:
 * token valid dengan role "recruiter" -> "recruiter",
 * token valid dengan role lain/hilang -> "jobseeker",
 * tanpa token / gagal decode -> null.
 */
export function getRoleFromToken(): UserRole | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "recruiter" ? "recruiter" : "jobseeker";
  } catch {
    return null;
  }
}

/** Gate boolean untuk area khusus recruiter (widget & halaman create). */
export function isRecruiter(): boolean {
  return getRoleFromToken() === "recruiter";
}

/**
 * Email dari payload JWT untuk avatar inisial. Murni baca token
 * lokal (tanpa fetch); null bila tak ada token / gagal decode.
 */
export function getEmailFromToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
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
  /** Klaim `exp` JWT (detik sejak epoch), bila ada. */
  exp?: number;
};

/**
 * Payload JWT lokal (tanpa verifikasi signature — hanya untuk gating UI
 * dan cek kedaluwarsa cepat). Otorisasi sesungguhnya tetap di backend.
 * Null bila tak ada token / struktur token salah / gagal decode.
 */
export function getTokenPayload(): TokenPayload | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
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

/** True bila payload membawa `exp` dan sudah lewat (cek jam lokal). */
export function isPayloadExpired(payload: TokenPayload): boolean {
  return payload.exp !== undefined && payload.exp * 1000 <= Date.now();
}
