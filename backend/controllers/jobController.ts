import type { Request, Response } from "express";

import db from "../database";

export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, description, location, company } = req.body;

    if (!title || !title.toString().trim()) {
      return res.status(400).json({ success: false, message: "Title wajib diisi" });
    }
    if (!description || !description.toString().trim()) {
      return res.status(400).json({ success: false, message: "Description wajib diisi" });
    }
    if (!location || !location.toString().trim()) {
      return res.status(400).json({ success: false, message: "Location wajib diisi" });
    }
    if (!company || !company.toString().trim()) {
      return res.status(400).json({ success: false, message: "Company wajib diisi" });
    }

    const recruiterId = req.user!.id;

    const [insertResult] = await db.execute(
      "INSERT INTO jobs (title, description, location, company, recruiter_id) VALUES (?, ?, ?, ?, ?)",
      [title, description, location, company, recruiterId]
    );
    const insertId = (insertResult as any).insertId;

    const [rows] = await db.execute(
      "SELECT id, title, description, location, company, recruiter_id, created_at FROM jobs WHERE id = ?",
      [insertId]
    );
    const job = (rows as any[])[0];

    return res.status(201).json({
      success: true,
      message: "Job berhasil dibuat",
      job,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, title, description, location, company, recruiter_id, created_at FROM jobs ORDER BY created_at DESC"
    );

    return res.status(200).json({
      success: true,
      jobs: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data jobs",
    });
  }
};
