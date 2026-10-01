import { Router } from "express";
import { register, login } from "./controllers/authController";
import { verifyToken } from "./middleware/authMiddleware";

const router = Router();

// Daftar endpoint API (dipasang di index.ts sebagai /api/...)
router.post("/register", register);
router.post("/login", login);

// verifyToken jalan duluan: tanpa token valid, fungsi di belakangnya tidak dipanggil
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Berhasil mengakses profile",
    user: (req as any).user, // dipasang oleh verifyToken
  });
});

export default router;