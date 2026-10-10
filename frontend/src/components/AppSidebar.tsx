"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavIconKind, NavItem } from "../lib/nav";
import type { UserRole } from "../lib/auth";
import { getNavItems } from "../lib/nav";

function NavIcon({ kind }: { kind: NavIconKind }) {
  const cls = "h-5 w-5 shrink-0";
  switch (kind) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13" y="13" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "file":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
          <path d="M6 3.5h8L19 8.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 3.5V8.5H19" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8.5 13h7M8.5 16.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "briefcase":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
          <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}

type AppSidebarProps = {
  role: UserRole | null;
  collapsed?: boolean;
  showCollapseToggle?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
};

function NavList({
  items,
  pathname,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string | null;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1" role="list">
      {items.map((item) => {
        // Exact match untuk halaman utama; prefix match agar halaman nested
        // recruiter (/recruiter/jobs/[id]/edit, .../applicants) tetap
        // menyorot induk "Lowongan Saya". Tidak ada false-positive:
        // tidak ada href "/" dan tidak ada sibling prefix yang tumpang tindih.
        const active =
          pathname === item.href ||
          (pathname !== null &&
            item.href !== "/" &&
            pathname.startsWith(`${item.href}/`));
        return (
          <li key={`${item.href}-${item.label}`}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                collapsed ? "justify-center px-0" : ""
              } ${
                active
                  ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/15"
                  : "text-ink-500 hover:bg-slate-100 hover:text-ink-900"
              }`}
            >
              <NavIcon kind={item.icon} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function AppSidebar({
  role,
  collapsed = false,
  showCollapseToggle = false,
  onToggleCollapse,
  onNavigate,
}: AppSidebarProps) {
  const pathname = usePathname();
  const items = getNavItems(role);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className={`flex h-16 items-center gap-2.5 border-b border-slate-100 px-4 ${collapsed ? "justify-center px-0" : ""}`}>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </span>
        {!collapsed && (
          <span className="truncate font-display text-base font-semibold tracking-tight text-ink-900">
            JobTrack
          </span>
        )}
      </div>

      <nav aria-label="Navigasi utama" className="flex-1 overflow-y-auto px-3 py-4">
        <NavList items={items} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
      </nav>

      {showCollapseToggle && onToggleCollapse && (
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Bentangkan sidebar" : "Ciutkan sidebar"}
            aria-expanded={!collapsed}
            className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-500 transition-colors duration-150 hover:bg-slate-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${collapsed ? "justify-center px-0" : ""}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={`h-5 w-5 shrink-0 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            >
              <path d="m14 7-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!collapsed && <span>Ciutkan</span>}
          </button>
        </div>
      )}
    </div>
  );
}
