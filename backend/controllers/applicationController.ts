import type { Request, Response } from "express";
import { promises as fsPromises } from "fs";
import path from "path";

import { CV_DIR } from "../config/config";
import db from "../config/database";
import { MAX_CV_BYTES } from "../middleware/uploadCv";
import { emitToUser, emitInsightUpdated } from "../sockets/socket";

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
              users.name AS jobseeker_name, users.email AS jobseeker_email,
              (applications.cv_path IS NOT NULL AND applications.cv_path <> '') AS has_cv
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
      "SELECT id, recruiter_id, title FROM jobs WHERE id = ?",
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

    let notificationId = 0;
    if (job?.recruiter_id) {
      const [notificationInsertResult] = await connection.execute(
        `INSERT INTO notifications
         (user_id, type, title, message, entity_type, entity_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          job.recruiter_id,
          "new_application",
          "Lamaran baru masuk",
          `Ada lamaran baru untuk lowongan: ${job.title}`,
          "application",
          insertId,
        ]
      );
      notificationId = (notificationInsertResult as any)?.insertId ?? 0;
    }

    // Commit hanya setelah pembaruan data lamaran dan notifikasi berhasil.
    await connection.commit();
    transactionActive = false;

    if (notificationId > 0 && job?.recruiter_id) {
      try {
        emitToUser(job.recruiter_id, "notification:new", {
          id: notificationId,
          user_id: job.recruiter_id,
          type: "new_application",
          title: "Lamaran baru masuk",
          message: `Ada lamaran baru untuk lowongan: ${job.title}`,
          entity_type: "application",
          entity_id: insertId,
          is_read: 0,
          created_at: new Date().toISOString(),
        });
      } catch (socketError) {
        console.error(socketError);
      }
    }

    try {
      emitInsightUpdated("application_created");
    } catch (socketError) {
      console.error(socketError);
    }

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
  const { id } = req.params;
  const recruiterId = req.user!.id;
  const { status } = req.body as { status?: unknown };

  if (typeof status !== "string" || !(APPLICATION_STATUSES as readonly string[]).includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status tidak valid. Nilai yang diterima: ${APPLICATION_STATUSES.join(", ")}.`,
    });
  }

  const connection = await db.getConnection();
  let transactionActive = false;
  let jobseekerId: number | null = null;
  let jobTitle: string | null = null;
  let oldStatus: string | null = null;
  let notificationId = 0;

  try {
    await connection.beginTransaction();
    transactionActive = true;

    const [appRows] = await connection.execute(
      `SELECT applications.jobseeker_id AS jobseeker_id, applications.status AS old_status,
              jobs.recruiter_id AS recruiter_id, jobs.title AS job_title
       FROM applications
       JOIN jobs ON jobs.id = applications.job_id
       WHERE applications.id = ?`,
      [id]
    );
    const application = (appRows as any[])[0];

    if (!application) {
      await connection.rollback();
      transactionActive = false;
      return res.status(404).json({
        success: false,
        message: "Lamaran tidak ditemukan",
      });
    }

    if (application.recruiter_id !== recruiterId) {
      await connection.rollback();
      transactionActive = false;
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke lamaran ini",
      });
    }

    jobseekerId = application.jobseeker_id;
    jobTitle = application.job_title;
    oldStatus = application.old_status;

    if (oldStatus === status) {
      await connection.rollback();
      transactionActive = false;
      return res.status(400).json({
        success: false,
        message: "Status lamaran sudah sesuai",
      });
    }

    await connection.execute("UPDATE applications SET status = ? WHERE id = ?", [status, id]);

    const [rows] = await connection.execute(
      "SELECT id, job_id, jobseeker_id, status, created_at FROM applications WHERE id = ?",
      [id]
    );
    const updatedApplication = (rows as any[])[0];

    if (jobseekerId) {
      const [notificationInsertResult] = await connection.execute(
        `INSERT INTO notifications
         (user_id, type, title, message, entity_type, entity_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          jobseekerId,
          "application_status_updated",
          "Status lamaran diperbarui",
          `Status lamaran Anda untuk lowongan "${jobTitle}" diubah menjadi ${status}`,
          "application",
          Number(id),
        ]
      );
      notificationId = (notificationInsertResult as any)?.insertId ?? 0;
    }

    await connection.commit();
    transactionActive = false;

    if (notificationId > 0 && jobseekerId) {
      try {
        emitToUser(jobseekerId, "notification:new", {
          id: notificationId,
          user_id: jobseekerId,
          type: "application_status_updated",
          title: "Status lamaran diperbarui",
          message: `Status lamaran Anda untuk lowongan "${jobTitle}" diubah menjadi ${status}`,
          entity_type: "application",
          entity_id: Number(id),
          is_read: 0,
          created_at: new Date().toISOString(),
        });
      } catch (socketError) {
        console.error(socketError);
      }
    }

    try {
      emitInsightUpdated("application_status_changed");
    } catch (socketError) {
      console.error(socketError);
    }

    return res.status(200).json({
      success: true,
      message: "Status lamaran berhasil diperbarui",
      application: updatedApplication,
    });
  } catch (error) {
    if (transactionActive) {
      try {
        await connection.rollback();
      } catch {
        // Abaikan error rollback agar error utama tetap dilaporkan.
      }
      transactionActive = false;
    }
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui status lamaran",
    });
  } finally {
    try {
      connection.release();
    } catch {
      // Abaikan error release koneksi agar respons tetap dikirim.
    }
  }
};

export const getApplicationCv = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user!.id;

    const [appRows] = await db.execute(
      `SELECT applications.id AS id,
              applications.cv_path AS cv_path,
              applications.cv_original_name AS cv_original_name,
              applications.cv_mime AS cv_mime,
              jobs.recruiter_id AS recruiter_id
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

    const cvPath = application.cv_path;
    if (!cvPath) {
      return res.status(404).json({
        success: false,
        message: "CV tidak tersedia",
      });
    }

    const resolvedCvDir = path.resolve(CV_DIR);
    const resolvedFile = path.resolve(String(cvPath));
    const insideDir =
      resolvedFile === resolvedCvDir ||
      resolvedFile.startsWith(resolvedCvDir + path.sep);
    if (!insideDir) {
      return res.status(404).json({
        success: false,
        message: "CV tidak tersedia",
      });
    }

    let stat;
    try {
      stat = await fsPromises.stat(resolvedFile);
    } catch {
      return res.status(404).json({
        success: false,
        message: "CV tidak tersedia",
      });
    }

    if (!stat.isFile()) {
      return res.status(404).json({
        success: false,
        message: "CV tidak tersedia",
      });
    }

    const rawOriginal = application.cv_original_name
      ? path.basename(String(application.cv_original_name))
      : `cv-${application.id}.pdf`;
    let safeName = rawOriginal.replace(/[^A-Za-z0-9._\-() ]/g, "_").trim();
    if (!safeName) safeName = `cv-${application.id}.pdf`;
    if (!/\.pdf$/i.test(safeName)) safeName = `${safeName}.pdf`;

    res.type(application.cv_mime || "application/pdf");
    return res.download(resolvedFile, safeName, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({
          success: false,
          message: "CV tidak tersedia",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil CV",
    });
  }
};
