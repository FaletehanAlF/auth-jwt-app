"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ShapeGrid from "../../components/ShapeGrid";

const CLOUDINARY_CLOUD_NAME = "bsu3p6yn";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type CloudinaryResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

const stack = [
  {
    title: "Frontend",
    value: "Next.js App Router",
    desc: "Form, validasi UI, dan routing /login, /register, /home.",
  },
  {
    title: "Backend",
    value: "Express + MySQL",
    desc: "Validasi Zod dan endpoint /api/register serta /api/login.",
  },
  {
    title: "Authentication",
    value: "JWT",
    desc: "Token disimpan di localStorage dengan key token.",
  },
];

const flow = [
  {
    title: "Register",
    desc: "POST ke /api/register. Berhasil akan diarahkan ke /login.",
  },
  {
    title: "Login",
    desc: "POST ke /api/login. Token disimpan, lalu diarahkan ke /home.",
  },
  {
    title: "Home",
    desc: "Halaman tujuan setelah login berhasil.",
  },
];

export default function HomePage() {
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleProfilePictureUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("File harus berupa gambar JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Ukuran file maksimal 5 MB.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "jobtrack");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const result = (await response.json()) as CloudinaryResponse;

      if (!response.ok) {
        throw new Error(
          result.error?.message ?? "Upload ke Cloudinary gagal.",
        );
      }

      if (!result.secure_url) {
        throw new Error("Respons Cloudinary tidak memiliki secure_url.");
      }

      setProfileImageUrl(result.secure_url);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Upload gambar gagal.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <ShapeGrid
          direction="diagonal"
          speed={0.4}
          squareSize={44}
          borderColor="rgba(15, 23, 42, 0.1)"
          hoverFillColor="rgba(13, 148, 136, 0.25)"
          shape="square"
          hoverTrailAmount={5}
        />
      </div>
      <div className="relative">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-[13px] font-semibold tracking-tight text-white">
            AJ
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Auth JWT App</p>
            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
              Next.js &middot; Express &middot; MySQL
            </p>
          </div>

          <nav className="ml-auto flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-800"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <p className="text-xs font-medium tracking-wide text-slate-500">
          Dashboard
        </p>
        <div className="mt-2 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl sm:leading-tight">
              Selamat datang di Auth JWT App
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-500 sm:text-[15px]">
              Simple authentication dengan Next.js, Express, MySQL, dan JWT.
              Alur register, login, dan home tetap dipertahankan apa adanya.
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row md:shrink-0">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition-colors duration-150 hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Buat akun
            </Link>
          </div>
        </div>

        <section className="mt-10 rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-xl font-semibold text-white">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt="Profile picture"
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>AJ</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold tracking-tight">
                Profile picture
              </h2>
              <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">
                Upload gambar ke Cloudinary. URL hasil upload hanya disimpan di
                state frontend.
              </p>
              <input
                id="profile-picture"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleProfilePictureUpload}
                disabled={isUploading}
                className="mt-4 block w-full max-w-sm cursor-pointer rounded-lg border border-slate-200 text-sm text-slate-600 file:mr-4 file:border-0 file:border-r file:border-slate-200 file:bg-slate-50 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-slate-500">
                JPG, PNG, atau WebP. Maksimal 5 MB.
              </p>

              {isUploading && (
                <p
                  role="status"
                  className="mt-3 flex items-center gap-2 text-sm text-slate-600"
                >
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                  Mengunggah gambar...
                </p>
              )}

              {uploadError && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                  {uploadError}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stack.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <p className="text-xs font-medium tracking-wide text-slate-500">
                {item.title}
              </p>
              <p className="mt-1.5 text-[15px] font-semibold tracking-tight">
                {item.value}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {item.desc}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-3 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold tracking-tight">
              Alur aplikasi
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Flow yang dipertahankan tanpa perubahan logic.
            </p>
          </div>
          <ol className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {flow.map((item) => (
              <li key={item.title} className="px-5 py-4 sm:px-6">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                  {item.desc}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-8 text-xs leading-relaxed text-slate-500">
          Portfolio project &middot; Styling diperbarui, authentication logic
          tidak diubah.
        </p>
      </main>
      </div>
    </div>
  );
}
