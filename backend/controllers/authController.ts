import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import db from "../database";
import { registerSchema, loginSchema } from "../validation";

const JWT_SECRET = "rahasia-jwt-project";

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validasi data dari client menggunakan Zod
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Data register tidak valid",
        errors: result.error.flatten().fieldErrors,
      });
    }

    // 2. Ambil data yang sudah lolos validasi
    const { name, email, password } = result.data;

    // 3. Cek apakah email sudah digunakan
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

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Simpan user ke database
    await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    // 6. Kirim response berhasil
    return res.status(201).json({
      success: true,
      message: "Register berhasil",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // 1. Validasi data login menggunakan Zod
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Data login tidak valid",
        errors: result.error.flatten().fieldErrors,
      });
    }

    // 2. Ambil email dan password yang sudah lolos validasi
    const { email, password } = result.data;

    // 3. Cari user berdasarkan email
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const users = rows as any[];

    // 4. Kalau user tidak ditemukan
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const user = users[0];

    // 5. Bandingkan password yang dikirim dengan password hash di database
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    // 6. Kalau password salah
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // 7. Buat JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // 8. Kirim token ke client
    return res.json({
      success: true,
      message: "Login berhasil",
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};