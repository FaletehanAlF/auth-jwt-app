import type { Request, Response } from "express";

import db from "../database";

export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const jobseekerId = req.user!.id;

    const [rows] = await db.execute(
      `SELECT applications.id AS id, applications.job_id, applications.jobseeker_id, applications.created_at,
              jobs.title, jobs.description, jobs.location, jobs.company, jobs.recruiter_id
       FROM applications
       JOIN jobs ON jobs.id = applications.job_id
       WHERE applications.jobseeker_id = ?
       ORDER BY applications.created_at DESC`,
      [jobseekerId]
    );

    return res.status(200).json({
      success: true,
      applications: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data lamaran",
    });
  }
};

export const applyJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jobseekerId = req.user!.id;

    const [jobRows] = await db.execute(
      "SELECT id FROM jobs WHERE id = ?",
      [id]
    );
    const job = (jobRows as any[])[0];

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job tidak ditemukan",
      });
    }

    const [insertResult] = await db.execute(
      "INSERT INTO applications (job_id, jobseeker_id) VALUES (?, ?)",
      [id, jobseekerId]
    );
    const insertId = (insertResult as any).insertId;

    const [rows] = await db.execute(
      "SELECT id, job_id, jobseeker_id, created_at FROM applications WHERE id = ?",
      [insertId]
    );
    const application = (rows as any[])[0];

    return res.status(201).json({
      success: true,
      message: "Lamaran berhasil dibuat",
      application,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat lamaran",
    });
  }
};
