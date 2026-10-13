import type { Request, Response } from "express";

import db from "../database";

/** Nilai status lamaran yang diizinkan (FASE 1). Harus sama dengan
 *  daftar ENUM pada migrasi backend/migrations/001-application-status.sql. */
const APPLICATION_STATUSES = ["pending", "reviewed", "interview", "accepted", "rejected"] as const;

export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const jobseekerId = req.user!.id;

    const [rows] = await db.execute(
      `SELECT applications.id AS id, applications.job_id, applications.jobseeker_id, applications.status, applications.created_at,
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

export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user!.id;

    const [jobRows] = await db.execute(
      "SELECT id, recruiter_id FROM jobs WHERE id = ?",
      [id]
    );
    const job = (jobRows as any[])[0];

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job tidak ditemukan",
      });
    }

    if (job.recruiter_id !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke job ini",
      });
    }

    const [rows] = await db.execute(
      `SELECT applications.id AS id, applications.job_id, applications.jobseeker_id, applications.status, applications.created_at,
              users.name AS jobseeker_name, users.email AS jobseeker_email
       FROM applications
       JOIN users ON users.id = applications.jobseeker_id
       WHERE applications.job_id = ?
       ORDER BY applications.created_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      applications: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data pelamar",
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

    // Tangani lamaran duplikat secara aman: cek sebelum INSERT agar tidak
    // membuat baris ganda. Data lama tidak diubah maupun dihapus.
    const [existingRows] = await db.execute(
      "SELECT id FROM applications WHERE job_id = ? AND jobseeker_id = ?",
      [id, jobseekerId]
    );
    if ((existingRows as any[]).length > 0) {
      return res.status(409).json({
        success: false,
        message: "Anda sudah melamar lowongan ini.",
      });
    }

    let insertId: number;
    try {
      const [insertResult] = await db.execute(
        "INSERT INTO applications (job_id, jobseeker_id, status) VALUES (?, ?, 'pending')",
        [id, jobseekerId]
      );
      insertId = (insertResult as any).insertId;
    } catch (insertError: any) {
      // Pertahanan berlapis terhadap race condition dua request bersamaan
      // (unique key uniq_job_jobseeker dari migrasi FASE 1).
      if (insertError?.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Anda sudah melamar lowongan ini.",
        });
      }
      throw insertError;
    }

    const [rows] = await db.execute(
      "SELECT id, job_id, jobseeker_id, status, created_at FROM applications WHERE id = ?",
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

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user!.id;
    const { status } = req.body as { status?: unknown };

    if (typeof status !== "string" || !(APPLICATION_STATUSES as readonly string[]).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Nilai yang diterima: ${APPLICATION_STATUSES.join(", ")}.`,
      });
    }

    // Ambil lamaran sekaligus pemilik lowongannya dalam satu query.
    // Identitas recruiter selalu dari JWT yang sudah diverifikasi,
    // tidak pernah dari input frontend.
    const [appRows] = await db.execute(
      `SELECT applications.id AS id, jobs.recruiter_id AS recruiter_id
       FROM applications
       JOIN jobs ON jobs.id = applications.job_id
       WHERE applications.id = ?`,
      [id]
    );
    const application = (appRows as any[])[0];

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Lamaran tidak ditemukan",
      });
    }

    if (application.recruiter_id !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke lamaran ini",
      });
    }

    // WHERE hanya pada id lamaran yang dimaksud — tidak menyentuh baris lain.
    await db.execute("UPDATE applications SET status = ? WHERE id = ?", [status, id]);

    const [rows] = await db.execute(
      "SELECT id, job_id, jobseeker_id, status, created_at FROM applications WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Status lamaran berhasil diperbarui",
      application: (rows as any[])[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui status lamaran",
    });
  }
};
