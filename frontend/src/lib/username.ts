export type UsernameRole = "jobseeker" | "recruiter" | string | null | undefined;

/**
 * Memformat username untuk tampilan berdasarkan role.
 * Recruiter mendapat akhiran `.recruiter`; jobseeker tetap username asli.
 * Akhiran tidak akan digandakan jika username sudah memilikinya.
 */
export function formatUsername(username?: string | null, role?: UsernameRole): string {
  const normalized = (username ?? "").trim().replace(/^@+/, "");
  if (!normalized) return "";

  const handle =
    role === "recruiter" && !/\.recruiter$/i.test(normalized)
      ? `${normalized}.recruiter`
      : normalized;

  return `@${handle}`;
}