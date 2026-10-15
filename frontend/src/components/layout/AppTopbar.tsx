"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { UserRole } from "../../lib/auth";
import UserAvatar from "./UserAvatar";
import NotificationBell from "./NotificationBell";

type AppTopbarProps = {
  title: string;
  subtitle?: string;
  email: string | null;
  role: UserRole | null;
  avatarUrl?: string | null;
  menuButtonExpanded: boolean;
  menuButtonControls: string;
  menuButtonId: string;
  onMenuClick: () => void;
};

const ROLE_LABEL: Record<UserRole, string> = {
  recruiter: "Recruiter",
  jobseeker: "Jobseeker",
};

export default function AppTopbar({
  title,
  subtitle,
  email,
  role,
  avatarUrl,
  menuButtonExpanded,
  menuButtonControls,
  menuButtonId,
  onMenuClick,
}: AppTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRootRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        avatarButtonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) firstItemRef.current?.focus();
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        id={menuButtonId}
        onClick={onMenuClick}
        aria-expanded={menuButtonExpanded}
        aria-controls={menuButtonControls}
        aria-label="Buka menu navigasi"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-500 transition-colors duration-150 hover:bg-slate-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-base font-semibold tracking-tight text-ink-900 sm:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-ink-500 sm:text-[13px]">{subtitle}</p>
        )}
      </div>

      <NotificationBell />


      <div ref={menuRootRef} className="relative">
        <button
          ref={avatarButtonRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={email ? `Menu akun ${email}` : "Menu akun"}
          className="flex items-center gap-2 rounded-full p-1 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <UserAvatar email={email} avatarUrl={avatarUrl} />
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-500">
            <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Menu akun"
            className="app-menu-pop absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <UserAvatar email={email} size="md" avatarUrl={avatarUrl} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">
                  {email ?? "Pengguna"}
                </p>
                {role && (
                  <p className="text-xs text-ink-500">{ROLE_LABEL[role]}</p>
                )}
              </div>
            </div>
            <div className="p-1.5">
              <Link
                ref={firstItemRef}
                href="/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 items-center rounded-xl px-3 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600"
              >
                Profil Saya
              </Link>
              <Link
                href="/login"
                role="menuitem"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user_name");
                  setMenuOpen(false);
                }}
                className="flex h-10 items-center rounded-xl px-3 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600"
              >
                Keluar
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
