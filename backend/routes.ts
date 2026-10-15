import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "./controllers/authController";
import { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs } from "./controllers/jobController";
import { applyJob, getMyApplications, getJobApplications, updateApplicationStatus, getApplicationCv } from "./controllers/applicationController";
import { getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead } from "./controllers/notificationController";
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

router.get("/jobs/:id", verifyToken, getJobById);

router.put("/jobs/:id", verifyToken, authorize("recruiter"), updateJob);

router.delete("/jobs/:id", verifyToken, authorize("recruiter"), deleteJob);

router.post("/jobs/:id/apply", verifyToken, authorize("jobseeker"), uploadCvSingle, applyJob);

router.get("/jobs/:id/applications", verifyToken, authorize("recruiter"), getJobApplications);

router.get("/applications/me", verifyToken, authorize("jobseeker"), getMyApplications);

router.patch("/applications/:id", verifyToken, authorize("recruiter"), updateApplicationStatus);

router.get("/applications/:id/cv", verifyToken, authorize("recruiter"), getApplicationCv);

router.get("/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Berhasil mengakses profile",
    user: req.user,
  });
});

router.get("/notifications", verifyToken, getNotifications);

router.get("/notifications/unread-count", verifyToken, getUnreadNotificationCount);

router.patch("/notifications/read-all", verifyToken, markAllNotificationsRead);

router.patch("/notifications/:id/read", verifyToken, markNotificationRead);

export default router;