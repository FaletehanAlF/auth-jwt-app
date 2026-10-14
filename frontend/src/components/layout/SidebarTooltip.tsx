"use client";

import { type CSSProperties } from "react";
import { createPortal } from "react-dom";

type SidebarTooltipProps = {
  label: string;
  rect: DOMRect | null;
};

export default function SidebarTooltip({ label, rect }: SidebarTooltipProps) {
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
