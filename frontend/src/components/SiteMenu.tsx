"use client";

import { useEffect, useState } from "react";
import StaggeredMenu, { type StaggeredMenuItem } from "./StaggeredMenu";

const BASE_ITEMS: StaggeredMenuItem[] = [
  { label: "Home", ariaLabel: "Go to home page", link: "/home" },
  { label: "About Us", ariaLabel: "Learn about us", link: "/about" },
  { label: "Profile", ariaLabel: "Go to profile page", link: "/profile" },
];

function getRoleFromToken(): "jobseeker" | "recruiter" | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "recruiter" ? "recruiter" : "jobseeker";
  } catch {
    return null;
  }
}

function buildItems(role: "jobseeker" | "recruiter" | null): StaggeredMenuItem[] {
  if (role === "recruiter") {
    return [
      ...BASE_ITEMS,
      { label: "Lowongan Saya", ariaLabel: "Job milik recruiter", link: "/recruiter/jobs" },
      { label: "Keluar", ariaLabel: "Logout", link: "/login", onClick: () => localStorage.removeItem("token") },
    ];
  }
  if (role === "jobseeker") {
    return [
      ...BASE_ITEMS,
      { label: "Lowongan", ariaLabel: "Lihat lowongan", link: "/home" },
      { label: "Lamaran Saya", ariaLabel: "Lamaran saya", link: "/applications" },
      { label: "Keluar", ariaLabel: "Logout", link: "/login", onClick: () => localStorage.removeItem("token") },
    ];
  }
  return [
    ...BASE_ITEMS,
    { label: "Masuk", ariaLabel: "Login", link: "/login" },
    { label: "Daftar", ariaLabel: "Register", link: "/register" },
  ];
}

// ============================================================
// CARA GANTI LOGO KIRI (sebelah tulisan JobTrack):
// 1. Taruh file gambar di folder: frontend/public/
//    contoh: frontend/public/logo.png (bisa .png / .svg / .webp)
// 2. Ganti LOGO_IMAGE_SRC di bawah dengan path-nya:
//    contoh: "/logo.png"  -> akan dimuat dari public/logo.png
// 3. Biarkan "" (kosong) jika ingin tetap pakai logo bawaan (ikon kotak biru).
// 4. Ganti LOGO_TEXT jika ingin ubah tulisan di samping logo.
// ============================================================
const LOGO_IMAGE_SRC = ""; // contoh: "/logo.png"
const LOGO_TEXT = "JobTrack";

export default function SiteMenu() {
  const [items, setItems] = useState<StaggeredMenuItem[]>(BASE_ITEMS);

  useEffect(() => {
    setItems(buildItems(getRoleFromToken()));
  }, []);

  return (
    <StaggeredMenu
      isFixed
      position="right"
      items={items}
      displaySocials={false}
      displayItemNumbering={true}
      colors={["#1e3a8a", "#60a5fa"]}
      accentColor="#2563eb"
      menuButtonColor="#fff"
      openMenuButtonColor="#111"
      changeMenuColorOnOpen={true}
      closeOnClickAway={true}
      logoUrl={LOGO_IMAGE_SRC || undefined}
      logoText={LOGO_TEXT}
      logoImageAlt={`${LOGO_TEXT} logo`}
    />
  );
}
