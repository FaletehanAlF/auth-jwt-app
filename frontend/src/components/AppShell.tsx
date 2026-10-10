"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { UserRole } from "../lib/auth";
import { getEmailFromToken, getRoleFromToken } from "../lib/auth";
import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const DRAWER_ID = "app-nav-drawer";
const MENU_BUTTON_ID = "app-menu-button";

/**
 * Shell dashboard (fondasi visual, belum dipakai halaman mana pun).
 * - Desktop (lg+): sidebar statis, bisa diciutkan (state in-memory).
 * - Mobile: drawer overlay + backdrop, Escape/backdrop/X menutup.
 * - Role & email dibaca sekali dari token lokal (lazy initializer,
 *   tanpa effect) — otorisasi tetap di backend.
 */
export default function AppShell({ title, subtitle, children }: AppShellProps) {
  const [role] = useState<UserRole | null>(() => getRoleFromToken());
  const [email] = useState<string | null>(() => getEmailFromToken());
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return;
    drawerCloseRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        document.getElementById(MENU_BUTTON_ID)?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh bg-mist font-sans text-ink-900 antialiased">
      <aside
        aria-label="Sidebar navigasi"
        className={`app-shell-shift fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200/70 transition-[width] duration-200 ease-out lg:block ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <AppSidebar
          role={role}
          collapsed={collapsed}
          showCollapseToggle
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </aside>

      {drawerOpen && (
        <div
          id={DRAWER_ID}
          role="dialog"
          aria-modal="true"
          aria-label="Navigasi utama"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div
            aria-hidden="true"
            onClick={closeDrawer}
            className="app-drawer-backdrop absolute inset-0 bg-ink-900/40"
          />
          <div className="app-drawer-panel absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl shadow-slate-900/10">
            <button
              ref={drawerCloseRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Tutup menu navigasi"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-ink-500 shadow-sm ring-1 ring-slate-200 transition-colors duration-150 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <AppSidebar role={role} onNavigate={closeDrawer} />
          </div>
        </div>
      )}

      <div
        className={`app-shell-shift transition-[padding-left] duration-200 ease-out ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-64"
        }`}
      >
        <AppTopbar
          title={title}
          subtitle={subtitle}
          email={email}
          role={role}
          menuButtonExpanded={drawerOpen}
          menuButtonControls={DRAWER_ID}
          menuButtonId={MENU_BUTTON_ID}
          onMenuClick={() => setDrawerOpen(true)}
        />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
