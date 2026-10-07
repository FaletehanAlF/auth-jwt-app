import { Router } from "express";
import { register, login } from "./controllers/authController";
import { createJob, getJobs, getJobById, updateJob, deleteJob } from "./controllers/jobController";
import { applyJob, getMyApplications } from "./controllers/applicationController";
import { verifyToken } from "./middleware/authMiddleware";
import { authorize } from "./middleware/authorizeMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post("/jobs", verifyToken, authorize("recruiter"), createJob);

router.get("/jobs", verifyToken, getJobs);

router.get("/jobs/:id", verifyToken, getJobById);

router.put("/jobs/:id", verifyToken, authorize("recruiter"), updateJob);

router.delete("/jobs/:id", verifyToken, authorize("recruiter"), deleteJob);

router.post("/jobs/:id/apply", verifyToken, authorize("jobseeker"), applyJob);

router.get("/applications/me", verifyToken, authorize("jobseeker"), getMyApplications);

router.get("/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Berhasil mengakses profile",
    user: req.user,
  });
});

export default router;