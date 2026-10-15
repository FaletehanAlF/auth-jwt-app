import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(5, "Nama minimal 5 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32, "Token tidak valid").max(256, "Token tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const updateAvatarSchema = z.object({
  avatarUrl: z
    .string()
    .min(1, "URL foto profil tidak boleh kosong")
    .max(512, "URL foto profil terlalu panjang")
    .url("URL foto profil tidak valid")
    .refine(
      (url) => url.startsWith("https://res.cloudinary.com/"),
      "URL harus berasal dari Cloudinary"
    ),
});
