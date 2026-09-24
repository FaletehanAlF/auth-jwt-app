"use client";

import type { ChangeEvent, ReactNode } from "react";
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

const features: { title: string; desc: string; icon: ReactNode }[] = [
  {
    title: "Application Tracking",
    desc: "Keep track of every job application in one place.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <rect
          x="3"
          y="7.5"
          width="18"
          height="12.5"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Interview Management",
    desc: "Stay organized and keep important interview information within reach.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M8 3v3.5M16 3v3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M7.5 13.5h3M7.5 16.5h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Career Progress",
    desc: "Keep your job search organized and see your progress clearly.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <path
          d="M4 19.5h16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M6.5 16.5v-5M12 16.5V8M17.5 16.5v-8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const pipelineStages = [
  { name: "Applied", note: "Submitted", dot: "bg-teal-500" },
  { name: "Interview", note: "Scheduled", dot: "bg-cyan-500" },
  { name: "Offer", note: "Pending", dot: "bg-slate-400" },
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
        <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
            <Link href="/home" className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-400/15">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <rect
                    x="3"
                    y="7.5"
                    width="18"
                    height="12.5"
                    rx="2.5"
                    stroke="#5eead4"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"
                    stroke="#5eead4"
                    strokeWidth="1.8"
                  />
                  <path d="M3 12.5h18" stroke="#5eead4" strokeWidth="1.8" />
                </svg>
              </span>
              <span className="font-display text-base font-semibold tracking-tight text-white">
                JobTrack
              </span>
            </Link>

            <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 sm:flex">
              <Link
                href="/home"
                aria-current="page"
                className="rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium text-white"
              >
                Home
              </Link>
              <Link
                href="/applications"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white"
              >
                Applications
              </Link>
              <Link
                href="/profile"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white"
              >
                Profile
              </Link>
            </nav>

            <div className="ml-auto flex shrink-0 items-center">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold text-white ring-1 ring-white/20">
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt="Profile picture"
                    width={36}
                    height={36}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>JT</span>
                )}
              </span>
            </div>
          </div>

          <nav aria-label="Primary" className="border-t border-slate-100 sm:hidden">
            <div className="mx-auto flex w-full max-w-5xl items-center gap-1 px-4 py-2">
              <Link
                href="/home"
                aria-current="page"
                className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-900"
              >
                Home
              </Link>
              <Link
                href="/applications"
                className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Applications
              </Link>
              <Link
                href="/profile"
                className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Profile
              </Link>
            </div>
          </nav>
        </header>

        <main>
          <section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:pb-16">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div className="min-w-0">
                <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                  YOUR CAREER,
                  <br />
                  ORGANIZED.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                  Keep your job applications, interviews, and career progress
                  organized in one place.
                </p>
                <Link
                  href="/applications"
                  className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-neutral-900 px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                >
                  Start Tracking
                </Link>
              </div>

              <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold tracking-tight">
                    Application pipeline
                  </p>
                  <p className="text-xs text-slate-500">All stages in one view</p>
                </div>
                <ul className="mt-5 space-y-3">
                  {pipelineStages.map((stage) => (
                    <li
                      key={stage.name}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 px-3.5 py-3"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${stage.dot}`}
                      />
                      <span className="text-sm font-medium">{stage.name}</span>
                      <span className="ml-auto text-xs text-slate-500">
                        {stage.note}
                      </span>
                    </li>
                  ))}
                </ul>
                <div aria-hidden="true" className="mt-5 flex gap-1.5">
                  <span className="h-1.5 flex-1 rounded-full bg-teal-500" />
                  <span className="h-1.5 flex-1 rounded-full bg-cyan-400" />
                  <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 lg:pb-16">
            <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything you need to manage your job search
            </h2>
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-teal-700/10 text-teal-700">
                    {feature.icon}
                  </span>
                  <p className="mt-4 text-[15px] font-semibold tracking-tight">
                    {feature.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 lg:pb-16">
            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-xl font-semibold text-white">
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
            </div>
          </section>

          <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
            <div className="rounded-lg bg-neutral-950 px-6 py-10 text-center sm:px-10 sm:py-12">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Stay organized.
                <br />
                Keep moving forward.
              </h2>
              <Link
                href="/applications"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-medium text-neutral-900 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                Start Tracking
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="font-display text-sm font-semibold tracking-tight">
              JobTrack
            </p>
            <p className="text-xs text-slate-500">
              Career &amp; Job Application Tracker
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
