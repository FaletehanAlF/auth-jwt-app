"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import ShapeGrid from "../../components/ShapeGrid";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const CLOUDINARY_CLOUD_NAME = "bsu3p6yn";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type CloudinaryResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

export default function ProfilePage() {
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
    <div className="relative min-h-screen bg-linear-to-tr from-teal-800 via-teal-950 to-neutral-950 text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <ShapeGrid
          direction="diagonal"
          speed={0.4}
          squareSize={44}
          borderColor="rgba(94, 234, 212, 0.22)"
          hoverFillColor="rgba(45, 212, 191, 0.35)"
          shape="square"
          hoverTrailAmount={5}
        />
      </div>
      <div className="relative">
        <Navbar profileImageUrl={profileImageUrl} activePage="profile" />

        <main>
          <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
            <div className="rounded-lg border border-white/10 bg-neutral-950 p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xl font-semibold text-white ring-1 ring-white/20">
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
                    <span>JT</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-sm font-semibold tracking-tight text-white">
                    Profile picture
                  </h1>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-white/60">
                    Upload gambar ke Cloudinary. URL hasil upload hanya disimpan di
                    state frontend.
                  </p>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfilePictureUpload}
                    disabled={isUploading}
                    className="mt-4 block w-full max-w-sm cursor-pointer rounded-lg border border-white/15 text-sm text-white/80 file:mr-4 file:border-0 file:border-r file:border-white/15 file:bg-white/10 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <p className="mt-2 text-xs text-white/50">
                    JPG, PNG, atau WebP. Maksimal 5 MB.
                  </p>

                  {isUploading && (
                    <p
                      role="status"
                      className="mt-3 flex items-center gap-2 text-sm text-white/70"
                    >
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-teal-300" />
                      Mengunggah gambar...
                    </p>
                  )}

                  {uploadError && (
                    <p role="alert" className="mt-3 text-sm text-red-400">
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
