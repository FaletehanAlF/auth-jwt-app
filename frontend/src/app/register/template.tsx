import type { ReactNode } from "react";

export default function RegisterTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="animate-jobtrack-page">
      <div
        aria-hidden="true"
        className="animate-jobtrack-splash pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-neutral-950"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/15">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <rect
                x="3"
                y="7.5"
                width="18"
                height="12.5"
                rx="2.5"
                stroke="#5eead4"
                strokeWidth="1.8"
              />
              <path
                d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"
                stroke="#5eead4"
                strokeWidth="1.8"
              />
              <path d="M3 12.5h18" stroke="#5eead4" strokeWidth="1.8" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            JobTrack
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
