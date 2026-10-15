import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import db from "../config/database";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/validation";
import {
  generateResetToken,
  hashResetToken,
  RESET_TOKEN_TTL_MINUTES,
} from "../lib/resetToken";
import {
  buildResetLink,
  getResendConfig,
  sendPasswordResetEmail,
} from "../lib/mailer";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-jwt-project";

function invalidInput(res: Response, message: string, errors: unknown) {
  return res.status(400).json({ success: false, message, errors });
}

function serverError(res: Response, error: unknown) {
  console.error(error);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server",
  });
}

export const register = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return invalidInput(
        res,
        "Data register tidak valid",
        result.error.flatten().fieldErrors
      );
    }
    const { name, email, password } = result.data;

    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if ((existingUsers as any[]).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertResult] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    const insertId = (insertResult as any).insertId;

    const [newUserRows] = await db.execute(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [insertId]
    );
    const newUser = (newUserRows as any[])[0];

    return res.status(201).json({
      success: true,
      message: "Register berhasil",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return serverError(res, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return invalidInput(
        res,
        "Data login tidak valid",
        result.error.flatten().fieldErrors
      );
    }
    const { email, password } = result.data;
    const [rows] = await db.execute(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );
    const users = rows as any[];
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }
    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

const GENERIC_FORGOT_MESSAGE =
  `Jika email terdaftar, tautan reset kata sandi telah dikirim. ` +
  `Periksa inbox atau spam. Tautan berlaku ${RESET_TOKEN_TTL_MINUTES} menit.`;

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return invalidInput(
        res,
        "Data tidak valid",
        result.error.flatten().fieldErrors
      );
    }
    const email = result.data.email.trim();

    const [rows] = await db.execute("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    const users = rows as any[];

    // Respons generik: email terdaftar maupun tidak mendapat pesan yang sama
    // agar keberadaan akun tidak bisa ditebak. Token tidak pernah dikirim
    // di respons API.
    if (users.length === 0) {
      return res.json({ success: true, message: GENERIC_FORGOT_MESSAGE });
    }
    const userId = users[0].id as number;

    try {
      getResendConfig();
    } catch {
      console.error("Konfigurasi Resend belum lengkap");
      return res.status(500).json({
        success: false,
        message: "Layanan email belum dikonfigurasi. Hubungi administrator.",
      });
    }

    const rawToken = generateResetToken();
    const tokenHash = hashResetToken(rawToken);

    // Satu token aktif per user: hapus token lama + buat baru dalam satu
    // transaksi pada koneksi yang sama. Baris user dikunci dulu dengan
    // SELECT ... FOR UPDATE agar dua permintaan konkuren untuk user yang sama
    // terserialisasi (DELETE atas 0 baris saja tidak mengunci apa pun,
    // sehingga tanpa kunci ini dua INSERT konkuren bisa lolos bersamaan).
    // Email dikirim SETELAH commit agar transaksi tidak menahan lock selama
    // I/O jaringan; bila kirim gagal, token baru dihapus (fail-closed).
    const tokenConn = await db.getConnection();
    try {
      await tokenConn.beginTransaction();
      const [lockedUsers] = await tokenConn.execute(
        "SELECT id FROM users WHERE id = ? FOR UPDATE",
        [userId]
      );
      if ((lockedUsers as any[]).length === 0) {
        await tokenConn.rollback();
        return res.json({ success: true, message: GENERIC_FORGOT_MESSAGE });
      }
      await tokenConn.execute(
        "DELETE FROM password_reset_tokens WHERE user_id = ?",
        [userId]
      );
      await tokenConn.execute(
        "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) " +
          "VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))",
        [userId, tokenHash]
      );
      await tokenConn.commit();
    } catch (txError) {
      try {
        await tokenConn.rollback();
      } catch {
        // abaikan kegagalan rollback
      }
      throw txError;
    } finally {
      tokenConn.release();
    }

    try {
      await sendPasswordResetEmail(email, buildResetLink(rawToken));
    } catch (error) {
      // Jangan beri sukses palsu: hapus token yang tidak terkirim agar tidak
      // ada token aktif yang tidak bisa dipakai, lalu kembalikan error jelas.
      // Best-effort: kegagalan hapus tidak boleh menutupi status 500.
      try {
        await db.execute(
          "DELETE FROM password_reset_tokens WHERE token_hash = ?",
          [tokenHash]
        );
      } catch {
        // abaikan; respons tetap 500 agar tidak ada sukses palsu
      }
      console.error("Gagal mengirim email reset kata sandi");
      return res.status(500).json({
        success: false,
        message: "Gagal mengirim email reset. Silakan coba lagi.",
      });
    }

    return res.json({ success: true, message: GENERIC_FORGOT_MESSAGE });
  } catch (error) {
    return serverError(res, error);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  // Validasi dulu sebelum mengambil koneksi agar request tidak valid
  // tidak menahan koneksi pool.
  const result = resetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    return invalidInput(
      res,
      "Data tidak valid",
      result.error.flatten().fieldErrors
    );
  }
  const tokenHash = hashResetToken(result.data.token);
  const newPassword = result.data.password;

  let connection: Awaited<ReturnType<typeof db.getConnection>> | undefined;
  let inTransaction = false;
  try {
    connection = await db.getConnection();

    await connection.beginTransaction();
    inTransaction = true;

    const [tokenRows] = await connection.execute(
      "SELECT id, user_id, expires_at, used_at FROM password_reset_tokens " +
        "WHERE token_hash = ? FOR UPDATE",
      [tokenHash]
    );
    const tokens = tokenRows as any[];
    if (tokens.length === 0) {
      await connection.rollback();
      inTransaction = false;
      return res.status(400).json({
        success: false,
        message: "Tautan tidak valid atau sudah kedaluwarsa.",
      });
    }
    const tokenRow = tokens[0];

    if (
      tokenRow.used_at !== null ||
      new Date(tokenRow.expires_at).getTime() <= Date.now()
    ) {
      await connection.rollback();
      inTransaction = false;
      return res.status(400).json({
        success: false,
        message: "Tautan tidak valid atau sudah kedaluwarsa.",
      });
    }

    const [userRows] = await connection.execute(
      "SELECT id FROM users WHERE id = ? FOR UPDATE",
      [tokenRow.user_id]
    );
    if ((userRows as any[]).length === 0) {
      await connection.rollback();
      inTransaction = false;
      return res.status(400).json({
        success: false,
        message: "Tautan tidak valid atau sudah kedaluwarsa.",
      });
    }

    // Hash kompatibel dengan login (bcrypt, cost 10). Hanya kolom password
    // yang diubah; role/email/profil tidak disentuh.
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      tokenRow.user_id,
    ]);

    // Tandai token terpakai secara atomik; affectedRows 0 berarti balapan
    // pemakaian ganda -> tolak.
    const [markUsed] = await connection.execute(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ? AND used_at IS NULL",
      [tokenRow.id]
    );
    if ((markUsed as any).affectedRows !== 1) {
      await connection.rollback();
      inTransaction = false;
      return res.status(400).json({
        success: false,
        message: "Tautan tidak valid atau sudah kedaluwarsa.",
      });
    }

    // Batalkan semua token lain milik user yang sama setelah password diganti.
    await connection.execute(
      "DELETE FROM password_reset_tokens WHERE user_id = ? AND id <> ?",
      [tokenRow.user_id, tokenRow.id]
    );

    await connection.commit();
    inTransaction = false;
    return res.json({
      success: true,
      message: `Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru.`,
    });
  } catch (error) {
    if (connection && inTransaction) {
      try {
        await connection.rollback();
      } catch {
        // abaikan kegagalan rollback
      }
      inTransaction = false;
    }
    // Jangan log token/password; serverError hanya mencatat objek error.
    return serverError(res, error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
