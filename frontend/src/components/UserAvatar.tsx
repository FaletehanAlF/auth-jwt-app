"use client";

type UserAvatarProps = {
  email: string | null;
  size?: "sm" | "md";
};

/** Avatar inisial dari email (tanpa fetch; lihat getEmailFromToken). */
export default function UserAvatar({ email, size = "sm" }: UserAvatarProps) {
  const initial = (email?.trim().charAt(0) || "?").toUpperCase();
  const dims =
    size === "md" ? "h-10 w-10 text-sm" : "h-9 w-9 text-[13px]";

  return (
    <span
      aria-hidden="true"
      title={email ?? "Pengguna"}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-600 font-semibold text-white ring-1 ring-black/5 ${dims}`}
    >
      {initial}
    </span>
  );
}
