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
