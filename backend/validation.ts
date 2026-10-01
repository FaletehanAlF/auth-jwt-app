import { z } from "zod";

// Aturan input register
export const registerSchema = z.object({
  name: z.string().min(5, "Nama minimal 5 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

// Aturan input login
export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
