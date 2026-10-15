import { Resend } from "resend";
import { RESET_TOKEN_TTL_MINUTES } from "./resetToken";

function getFrontendBaseUrl(): string {
  const raw =
    process.env.FRONTEND_URL || "http://localhost:5000,http://10.2.12.75:5000";
  const first = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];
  return (first || "http://localhost:5000").replace(/\/+$/, "");
}

export function getResendConfig(): { apiKey: string; from: string } {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const from = (process.env.RESEND_FROM_EMAIL || "").trim();
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY belum diisi. Cek backend/.env (lihat .env.example)."
    );
  }
  if (!from) {
    throw new Error(
      "RESEND_FROM_EMAIL belum diisi. Gunakan alamat pengirim yang sudah diverifikasi di Resend."
    );
  }
  return { apiKey, from };
}

export function buildResetLink(rawToken: string): string {
  return `${getFrontendBaseUrl()}/reset-password?token=${encodeURIComponent(
    rawToken
  )}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<void> {
  const { apiKey, from } = getResendConfig();
  const resend = new Resend(apiKey);

  const subject = "Reset kata sandi JobTrack";
  const text =
    `Halo,\n\n` +
    `Kami menerima permintaan reset kata sandi untuk akun JobTrack Anda.\n` +
    `Klik tautan berikut untuk membuat kata sandi baru (berlaku ${RESET_TOKEN_TTL_MINUTES} menit, satu kali pakai):\n\n` +
    `${resetLink}\n\n` +
    `Jika Anda tidak meminta reset ini, abaikan email ini. Kata sandi Anda tidak akan berubah.\n\n` +
    `Salam,\nTim JobTrack`;

  const html =
    `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">` +
    `<h2 style="margin:0 0 8px;">Reset kata sandi JobTrack</h2>` +
    `<p>Kami menerima permintaan reset kata sandi untuk akun Anda.</p>` +
    `<p>Klik tombol berikut untuk membuat kata sandi baru. Tautan berlaku <strong>${RESET_TOKEN_TTL_MINUTES} menit</strong> dan hanya dapat dipakai <strong>satu kali</strong>.</p>` +
    `<p style="margin:24px 0;"><a href="${escapeHtml(resetLink)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;">Buat kata sandi baru</a></p>` +
    `<p style="font-size:13px;color:#64748b;">Jika tombol tidak berfungsi, salin tautan ini ke browser:<br><span style="word-break:break-all;">${escapeHtml(resetLink)}</span></p>` +
    `<p style="font-size:13px;color:#64748b;">Jika Anda tidak meminta reset ini, abaikan email ini. Kata sandi Anda tidak akan berubah.</p>` +
    `<p style="font-size:13px;color:#64748b;">Salam,<br>Tim JobTrack</p>` +
    `</div>`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend gagal mengirim email: ${error.message}`);
  }
}
