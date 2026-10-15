import crypto from "crypto";

// Masa berlaku tautan reset (menit). Singkat agar token curian cepat kedaluwarsa.
export const RESET_TOKEN_TTL_MINUTES = 15;

// Token mentah 32 byte -> 64 karakter hex (256 bit, CSPRNG).
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Simpan hanya hash SHA-256 di database, bukan token mentah.
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
