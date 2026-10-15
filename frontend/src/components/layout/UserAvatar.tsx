"use client";

import Image from "next/image";

type UserAvatarProps = {
  email: string | null;
  size?: "sm" | "md";
  avatarUrl?: string | null;
};

export default function UserAvatar({ email, size = "sm", avatarUrl }: UserAvatarProps) {
  const initial = (email?.trim().charAt(0) || "?").toUpperCase();
  const dims =
    size === "md" ? "h-10 w-10 text-sm" : "h-9 w-9 text-[13px]";

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={email ?? "Foto profil"}
        width={size === "md" ? 40 : 36}
        height={size === "md" ? 40 : 36}
        unoptimized
        className={`shrink-0 rounded-full object-cover ring-1 ring-black/5 ${dims}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      title={email ?? "Pengguna"}
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white ring-1 ring-black/5 ${dims}`}
    >
      {initial}
    </span>
  );
}
