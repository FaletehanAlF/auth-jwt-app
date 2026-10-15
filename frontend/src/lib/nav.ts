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

export function getNavItems(role: UserRole | null): NavItem[] {
  if (role === "recruiter") {
    return [
      { label: "Dashboard", href: "/home", icon: "dashboard" },
      { label: "Lowongan", href: "/recruiter/jobs", icon: "briefcase" },
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
