"use client";

import { type CSSProperties } from "react";
import { createPortal } from "react-dom";

type SidebarTooltipProps = {
  label: string;
  /**
   * Kotak item di viewport saat pointer masuk, diukur satu kali.
   * Sidebar tidak bergerak selama hover, jadi cukup diukur sekali;
   * tooltip sendiri yang menutup diri saat halaman di-scroll atau
   * jendela di-resize (lihat NavList).
   */
  rect: DOMRect | null;
};

/**
 * Tooltip nama menu untuk sidebar yang sedang dicutkan.
 *
 * Dipakai lewat portal ke <body> karena <nav> memakai
 * `overflow-y-auto`; apa pun yang keluar dari rel 76px akan terpotong
 * di sana. Ini juga menggantikan `title` bawaan browser, yang
 * muncul mendadak, tidak bisa di-style, dan nabrak sama state hover
 * item — persis keluhan "hover bertabrakan".
 *
 * Murni dekoratif (`aria-hidden`): nama item sudah ada di
 * `aria-label` link, jadi tidak diumumkan dua kali.
 */
export default function SidebarTooltip({ label, rect }: SidebarTooltipProps) {
  // Tidak perlu state "mounted": `rect` hanya terisi setelah timer hover
  // berjalan di sisi klien, jadi saat SSR/`typeof document` check ini
  // sudah cukup untuk menjaga portal tetap aman.
  if (typeof document === "undefined" || !rect) return null;

  const style: CSSProperties = {
    left: `${Math.round(rect.right)}px`,
    top: `${Math.round(rect.top + rect.height / 2)}px`,
  };

  return createPortal(
    <span
      aria-hidden="true"
      style={style}
      className="sidebar-tip pointer-events-none fixed z-70 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg shadow-slate-900/20"
    >
      {label}
    </span>,
    document.body,
  );
}
