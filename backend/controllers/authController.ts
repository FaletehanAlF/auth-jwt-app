import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import db from "../database";
import { registerSchema, loginSchema } from "../validation";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-jwt-project";

// Balasan 400 untuk input yang tidak lolos validasi Zod
function invalidInput(res: Response, message: string, errors: unknown) {
  return res.status(400).json({ success: false, message, errors });
}

// Balasan 500 untuk error tak terduga (misal database mati)
function serverError(res: Response, error: unknown) {
  console.error(error);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server",
  });
}

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Cek input sesuai aturan di validation.ts
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return invalidInput(
        res,
        "Data register tidak valid",
        result.error.flatten().fieldErrors
      );
    }
    const { name, email, password } = result.data;

    // 2. Email tidak boleh dobel
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

    // 3. Acak password sebelum disimpan (10 = tingkat keamanan)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan user baru
    await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      success: true,
      message: "Register berhasil",
    });
  } catch (error) {
    return serverError(res, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // 1. Cek input sesuai aturan di validation.ts
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return invalidInput(
        res,
        "Data login tidak valid",
        result.error.flatten().fieldErrors
      );
    }
    const { email, password } = result.data;

    // 2. Cari user lewat email
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
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

    // 3. Cocokkan password (pesan error sengaja sama agar tidak membocorkan info)
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // 4. Buat token login (berlaku 1 jam) lalu kirim ke client
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "Login berhasil",
      token,
    });
  } catch (error) {
    return serverError(res, error);
  }
};
