import jwt from "jsonwebtoken";
import { TEST_JWT_SECRET } from "./testEnv";

export type TestRole = "jobseeker" | "recruiter";

/**
 * Token JWT pengujian.
 *
 * Ditandatangani dengan secret pengujian (lihat testEnv.ts) - bukan dengan
 * secret produksi. Payload meniru bentuk token yang issued backend
 * (controllers/authController.ts): { id, email, role }.
 *
 * `id` boleh palsu: role dibaca dari payload JWT (middleware/authorizeMiddleware.ts
 * memakai req.user.role dari token, bukan dari database), sehingga skenario
 * otorisasi bisa diuji tanpa data database.
 */
export function signToken(
  role: TestRole,
  id = 1,
  email = `${role}@test.local`
): string {
  return jwt.sign({ id, email, role }, TEST_JWT_SECRET, { expiresIn: "1h" });
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
