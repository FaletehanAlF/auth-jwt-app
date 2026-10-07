import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import db from "../database";
import { registerSchema, loginSchema } from "../validation";

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
