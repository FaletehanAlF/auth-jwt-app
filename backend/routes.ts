import { Router } from "express";
import db from "./config/database";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateAvatar,
  deleteAvatar,
} from "./controllers/authController";
import { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs } from "./controllers/jobController";
import { applyJob, getMyApplications, getJobApplications, updateApplicationStatus, getApplicationCv } from "./controllers/applicationController";
import { getInsights } from "./controllers/insightController";
import { getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead } from "./controllers/notificationController";
import { getRecruiterDashboard } from "./controllers/recruiterDashboardController";
import { verifyToken } from "./middleware/authMiddleware";
import { authorize } from "./middleware/authorizeMiddleware";
import {
  forgotPasswordLimiter,
  resetPasswordLimiter,
} from "./middleware/rateLimit";
import { uploadCvSingle } from "./middleware/uploadCv";


const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post("/auth/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/auth/reset-password", resetPasswordLimiter, resetPassword);

router.post("/jobs", verifyToken, authorize("recruiter"), createJob);

router.get("/jobs", verifyToken, getJobs);

router.get("/recruiter/jobs", verifyToken, authorize("recruiter"), getMyJobs);

router.get("/insights", verifyToken, authorize("jobseeker"), getInsights);

router.get("/jobs/:id", verifyToken, getJobById);

router.put("/jobs/:id", verifyToken, authorize("recruiter"), updateJob);

router.delete("/jobs/:id", verifyToken, authorize("recruiter"), deleteJob);

router.post("/jobs/:id/apply", verifyToken, authorize("jobseeker"), uploadCvSingle, applyJob);

router.get("/jobs/:id/applications", verifyToken, authorize("recruiter"), getJobApplications);

router.get("/applications/me", verifyToken, authorize("jobseeker"), getMyApplications);

router.patch("/applications/:id", verifyToken, authorize("recruiter"), updateApplicationStatus);

router.get("/applications/:id/cv", verifyToken, authorize("recruiter"), getApplicationCv);

router.get("/profile", verifyToken, async (req, res) => {
  try {
    let user: any;
    try {
      const [rows] = await db.execute(
        "SELECT id, email, role, avatar_url FROM users WHERE id = ?",
        [req.user!.id]
      );
      user = (rows as any[])[0];
    } catch (profileError: any) {
      if (profileError?.code === "ER_BAD_FIELD_ERROR") {
        const [rows] = await db.execute(
          "SELECT id, email, role FROM users WHERE id = ?",
          [req.user!.id]
        );
        user = (rows as any[])[0];
      } else {
        throw profileError;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Berhasil mengakses profile",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url ?? null,
      },
    });
  } catch (error) {
    console.error("GET /profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

router.put("/profile/avatar", verifyToken, updateAvatar);
router.delete("/profile/avatar", verifyToken, deleteAvatar);

router.get("/notifications", verifyToken, getNotifications);

router.get("/notifications/unread-count", verifyToken, getUnreadNotificationCount);

router.patch("/notifications/read-all", verifyToken, markAllNotificationsRead);

router.patch("/notifications/:id/read", verifyToken, markNotificationRead);

// Dashboard recruiter. Ditambahkan di akhir daftar supaya urutan route yang
// sudah ada (dan baseline kontrak tests/baseline/routes.json) tidak berubah
// - hanya satu baris kontrak baru yang muncul.
router.get("/recruiter/dashboard", verifyToken, authorize("recruiter"), getRecruiterDashboard);

export default router;