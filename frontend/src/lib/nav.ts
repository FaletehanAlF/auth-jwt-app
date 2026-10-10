import type { UserRole } from "./auth";

export type NavIconKind =
  | "dashboard"
  | "search"
  | "file"
  | "briefcase"
  | "user";

export type NavItem = {
  label: string;
  href: string;
  icon: NavIconKind;
};

/**
 * Menu sidebar per role. Href mengikuti route yang sudah ada.
 * Recruiter tidak punya halaman agregat "Pelamar" (pelamar diakses
 * per-lowongan via /recruiter/jobs/[id]/applicants), jadi menu Pelamar
 * sengaja tidak ditampilkan (Fase B2) daripada mengarah duplikat ke
 * /recruiter/jobs. Jangan tambah route agregat baru di fase ini.
 */
export function getNavItems(role: UserRole | null): NavItem[] {
  if (role === "recruiter") {
    return [
      { label: "Dashboard", href: "/home", icon: "dashboard" },
      { label: "Lowongan Saya", href: "/recruiter/jobs", icon: "briefcase" },
      { label: "Profil Saya", href: "/profile", icon: "user" },
    ];
  }
  return [
    { label: "Dashboard", href: "/home", icon: "dashboard" },
    { label: "Cari Lowongan", href: "/lowongan", icon: "search" },
    { label: "Lamaran Saya", href: "/applications", icon: "file" },
    { label: "Profil Saya", href: "/profile", icon: "user" },
  ];
}
