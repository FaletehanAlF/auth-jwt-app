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
    <div className="relative flex h-dvh flex-col overflow-hidden overscroll-none bg-linear-to-tr from-teal-800 via-teal-950 to-neutral-950 text-white">
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
      <div className="relative flex min-h-0 flex-1 flex-col">
        <header className="z-20 shrink-0 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
            <Link href="/home" className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-400/15">
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
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold text-white ring-1 ring-white/20">
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt="Profile picture"
                    width={32}
                    height={32}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>JT</span>
                )}
              </span>
            </div>
          </div>

          <nav aria-label="Primary" className="border-t border-white/10 sm:hidden">
            <div className="mx-auto flex w-full max-w-5xl items-center gap-1 px-4 py-1">
              <Link
                href="/home"
                aria-current="page"
                className="flex-1 rounded-lg bg-white/10 px-3 py-1 text-center text-[11px] font-medium text-white"
              >
                Home
              </Link>
              <Link
                href="/applications"
                className="flex-1 rounded-lg px-3 py-1 text-center text-[11px] font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                Applications
              </Link>
              <Link
                href="/profile"
                className="flex-1 rounded-lg px-3 py-1 text-center text-[11px] font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                Profile
              </Link>
            </div>
          </nav>
        </header>

        <main className="home-scroll-safe mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col justify-center px-4 sm:px-6">
          <section className="grid grid-cols-1 items-center gap-3 lg:grid-cols-2 lg:gap-10">
            <div className="min-w-0">
              <h1 className="font-display text-[26px] font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-4xl">
                YOUR CAREER,
                <br />
                ORGANIZED.
              </h1>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/70 sm:text-sm lg:mt-3 lg:text-[15px]">
                Keep your job applications, interviews, and career progress
                organized in one place.
              </p>
              <Link
                href="/applications"
                className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-teal-400 px-5 text-sm font-medium text-neutral-950 transition-colors duration-150 hover:bg-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 lg:mt-5 lg:h-11 lg:px-6"
              >
                Start Tracking
              </Link>
            </div>

            <div className="min-w-0 rounded-lg border border-white/10 bg-neutral-950 p-3 sm:p-4 lg:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-semibold tracking-tight text-white sm:text-sm">
                  Application pipeline
                </p>
                <p className="text-[11px] text-white/60 sm:text-xs">All stages in one view</p>
              </div>
              <ul className="mt-2 space-y-2 lg:mt-3 lg:space-y-3">
                {pipelineStages.map((stage) => (
                  <li
                    key={stage.name}
                      className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-1 lg:py-2"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${stage.dot}`}
                    />
                    <span className="text-[13px] font-medium text-white sm:text-sm">{stage.name}</span>
                    <span className="ml-auto text-[11px] text-white/60 sm:text-xs">
                      {stage.note}
                    </span>
                  </li>
                ))}
              </ul>
              <div aria-hidden="true" className="mt-2 hidden gap-1.5 sm:flex lg:mt-3">
                <span className="h-1 flex-1 rounded-full bg-teal-400" />
                <span className="h-1 flex-1 rounded-full bg-cyan-400" />
                <span className="h-1 flex-1 rounded-full bg-white/20" />
              </div>
            </div>
          </section>

          <section className="mt-2.5 lg:mt-4">
            <h2 className="font-display text-lg font-semibold tracking-tight text-white sm:text-2xl lg:text-2xl">
              Everything you need to manage your job search
            </h2>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-4 lg:mt-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border border-white/10 bg-neutral-950 p-2 sm:p-5 lg:p-4"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-teal-400/15 text-teal-300 sm:h-10 sm:w-10 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
                    {feature.icon}
                  </span>
                  <p className="mt-1.5 text-[11px] font-semibold leading-snug tracking-tight text-white sm:mt-4 sm:text-[15px]">
                    {feature.title}
                  </p>
                  <p className="mt-1 hidden text-sm leading-relaxed text-white/70 sm:block lg:mt-1.5 lg:text-[13px]">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-2.5 lg:mt-4">
            <div className="rounded-lg border border-white/10 bg-neutral-950 p-2.5 sm:p-4 lg:p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white ring-1 ring-white/20 sm:h-14 sm:w-14 sm:text-base lg:h-12 lg:w-12">
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt="Profile picture"
                      width={56}
                      height={56}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>JT</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-[13px] font-semibold tracking-tight text-white sm:text-sm">
                    Profile picture
                  </h2>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfilePictureUpload}
                    disabled={isUploading}
                    className="mt-1.5 block w-full max-w-44 cursor-pointer rounded-lg border border-white/15 text-[11px] text-white/80 file:mr-2 file:border-0 file:border-r file:border-white/15 file:bg-white/10 file:px-3 file:py-1.5 file:text-[11px] file:font-medium file:text-white hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-xs sm:text-xs"
                  />
                  <p className="mt-1 hidden text-[11px] text-white/50 sm:block">
                    JPG, PNG, atau WebP. Maksimal 5 MB.
                  </p>

                  {isUploading && (
                    <p
                      role="status"
                      className="mt-1.5 flex items-center gap-2 text-xs text-white/70"
                    >
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-teal-300" />
                      Mengunggah gambar...
                    </p>
                  )}

                  {uploadError && (
                    <p role="alert" className="mt-1.5 text-xs text-red-400">
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-2.5 lg:mt-4">
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-neutral-950 px-4 py-2 sm:px-6 lg:px-6 lg:py-3">
              <h2 className="min-w-0 flex-1 font-display text-[13px] font-semibold tracking-tight text-white sm:text-xl lg:text-lg">
                Stay organized. Keep moving forward.
              </h2>
              <Link
                href="/applications"
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-white px-4 text-[13px] font-medium text-neutral-900 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 sm:h-10 sm:px-5 sm:text-sm lg:h-11 lg:px-6"
              >
                Start Tracking
              </Link>
            </div>
          </section>
        </main>

        <footer className="hidden shrink-0 border-t border-white/10 sm:block">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-2 sm:px-6">
            <p className="font-display text-xs font-semibold tracking-tight text-white">
              JobTrack
            </p>
            <p className="text-[11px] text-white/60">
              Career &amp; Job Application Tracker
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
