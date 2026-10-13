import type { Request, Response } from "express";
import { promises as fsPromises } from "fs";
import path from "path";

import db from "../database";
import { MAX_CV_BYTES } from "../middleware/uploadCv";

/** Nilai status lamaran yang diizinkan (FASE 1). Harus sama dengan
 *  daftar ENUM pada migrasi backend/migrations/001-application-status.sql. */
const APPLICATION_STATUSES = ["pending", "reviewed", "interview", "accepted", "rejected"] as const;

// Hapus file upload jika request gagal setelah file tersimpan (anti file yatim).
async function removeUploadedFile(filePath?: string): Promise<void> {
  if (!filePath) return;
  try {
    await fsPromises.unlink(filePath);
  } catch {
    // Abaikan: file mungkin sudah tidak ada.
  }
}

// Validasi signature PDF (%PDF-) dari 5 byte pertama. Tidak percaya ekstensi/MIME saja.
async function hasPdfSignature(filePath: string): Promise<boolean> {
  const handle = await fsPromises.open(filePath, "r");
  try {
    const buf = Buffer.alloc(5);
    const { bytesRead } = await handle.read(buf, 0, 5, 0);
    return bytesRead === 5 && buf.toString("ascii") === "%PDF-";
  } finally {
    await handle.close();
  }
}

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
  const uploaded = req.file;
  let uploadedPath: string | undefined = uploaded?.path;
  let connection: any;
  let transactionActive = false;
  try {
    const { id } = req.params;
    const jobseekerId = req.user!.id;

    // CV wajib: multipart/form-data field "cv". Tanpa file → 400 (tanpa orphan).
    if (!uploaded || !uploadedPath) {
      return res.status(400).json({
        success: false,
        message: "CV wajib diunggah dalam format PDF.",
      });
    }
    uploadedPath = uploaded.path;

    // Pertahanan berlapis (multer sudah filter): ekstensi + MIME + ukuran.
    const ext = path.extname(uploaded.originalname).toLowerCase();
    if (ext !== ".pdf" || uploaded.mimetype !== "application/pdf") {
      await removeUploadedFile(uploadedPath);
      return res.status(400).json({
        success: false,
        message: "CV harus berformat PDF.",
      });
    }
    if (uploaded.size > MAX_CV_BYTES || uploaded.size === 0) {
      await removeUploadedFile(uploadedPath);
      return res.status(413).json({
        success: false,
        message: "Ukuran CV maksimal 5 MB.",
      });
    }

    // Signature PDF asli — tolak file yang hanya berganti ekstensi.
    let validPdf = false;
    try {
      validPdf = await hasPdfSignature(uploadedPath as string);
    } catch {
      validPdf = false;
    }
    if (!validPdf) {
      await removeUploadedFile(uploadedPath);
      return res.status(400).json({
        success: false,
        message: "File CV tidak valid. Unggah PDF yang valid.",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionActive = true;

    const [jobRows] = await connection.execute(
      "SELECT id FROM jobs WHERE id = ?",
      [id]
    );
    const job = (jobRows as any[])[0];

    if (!job) {
      await connection.rollback();
      transactionActive = false;
      await removeUploadedFile(uploadedPath);
      return res.status(404).json({
        success: false,
        message: "Job tidak ditemukan",
      });
    }

    // Tangani lamaran duplikat secara aman: cek sebelum INSERT agar tidak
    // membuat baris ganda. Data lama tidak diubah maupun dihapus.
    const [existingRows] = await connection.execute(
      "SELECT id FROM applications WHERE job_id = ? AND jobseeker_id = ?",
      [id, jobseekerId]
    );
    if ((existingRows as any[]).length > 0) {
      await connection.rollback();
      transactionActive = false;
      await removeUploadedFile(uploadedPath);
      return res.status(409).json({
        success: false,
        message: "Anda sudah melamar lowongan ini.",
      });
    }

    let insertId: number;
    try {
      const [insertResult] = await connection.execute(
        "INSERT INTO applications (job_id, jobseeker_id, status, cv_path, cv_original_name, cv_mime, cv_size) VALUES (?, ?, 'pending', ?, ?, ?, ?)",
        [id, jobseekerId, uploadedPath, uploaded.originalname.slice(0, 255), uploaded.mimetype, uploaded.size]
      );
      insertId = (insertResult as any).insertId;
    } catch (insertError: any) {
      // Rollback memastikan database tidak menyimpan aplikasi tanpa file jika insert gagal.
      await connection.rollback();
      transactionActive = false;
      await removeUploadedFile(uploadedPath);
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

    const [rows] = await connection.execute(
      "SELECT id, job_id, jobseeker_id, status, created_at FROM applications WHERE id = ?",
      [insertId]
    );
    const application = (rows as any[])[0];

    // Commit hanya setelah SELECT respons berhasil; jika gagal, catch akan rollback.
    await connection.commit();
    transactionActive = false;

    return res.status(201).json({
      success: true,
      message: "Lamaran berhasil dibuat",
      application,
    });
  } catch (error) {
    // Jika post-INSERT SELECT atau commit gagal, rollback membatalkan aplikasi
    // yang baru dibuat agar DB tidak menyimpan aplikasi tanpa file CV.
    if (transactionActive && connection) {
      try {
        await connection.rollback();
      } catch {
        // Abaikan error rollback agar error utama tetap dilaporkan.
      }
      transactionActive = false;
    }
    await removeUploadedFile(uploadedPath);
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat lamaran",
    });
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch {
        // Abaikan error release koneksi agar respons tetap dikirim.
      }
    }
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
