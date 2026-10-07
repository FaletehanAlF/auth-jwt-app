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

export const getMyJobs = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, title, description, location, company, recruiter_id, created_at FROM jobs WHERE recruiter_id = ? ORDER BY created_at DESC",
      [req.user!.id]
    );

    return res.status(200).json({
      success: true,
      jobs: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil lowongan recruiter",
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

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      "SELECT id, title, description, location, company, recruiter_id, created_at FROM jobs WHERE id = ?",
      [id]
    );
    const job = (rows as any[])[0];

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail job",
    });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

    const [rows] = await db.execute(
      "SELECT id, title, description, location, company, recruiter_id, created_at FROM jobs WHERE id = ?",
      [id]
    );
    const job = (rows as any[])[0];

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job tidak ditemukan",
      });
    }

    if (job.recruiter_id !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke job ini",
      });
    }

    await db.execute(
      "UPDATE jobs SET title = ?, description = ?, location = ?, company = ? WHERE id = ?",
      [title, description, location, company, id]
    );

    const [updatedRows] = await db.execute(
      "SELECT id, title, description, location, company, recruiter_id, created_at FROM jobs WHERE id = ?",
      [id]
    );
    const updatedJob = (updatedRows as any[])[0];

    return res.status(200).json({
      success: true,
      message: "Job berhasil diperbarui",
      job: updatedJob,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      "SELECT id, title, description, location, company, recruiter_id, created_at FROM jobs WHERE id = ?",
      [id]
    );
    const job = (rows as any[])[0];

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job tidak ditemukan",
      });
    }

    if (job.recruiter_id !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke job ini",
      });
    }

    await db.execute("DELETE FROM jobs WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Job berhasil dihapus",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};
