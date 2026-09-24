import { Router } from "express";
import { register, login } from "./controllers/authController";
import { verifyToken } from "./middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/profile", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Berhasil mengakses profile",
    user: (req as any).user,
  });
});

export default router;