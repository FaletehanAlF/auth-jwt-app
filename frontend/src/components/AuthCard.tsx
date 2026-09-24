import type { ReactNode } from "react";
import ShapeGrid from "./ShapeGrid";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

// Layout kartu auth terpusat (dipakai login & register).
// Background tetap JobTrack, isi form berbeda per halaman.
export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="relative flex h-dvh items-center justify-center overflow-hidden overscroll-none bg-linear-to-tr from-teal-800 via-teal-950 to-neutral-950 p-4 text-slate-900 sm:p-6">
      <div aria-hidden="true" className="absolute inset-0">
        <ShapeGrid
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="rgba(94, 234, 212, 0.22)"
          hoverFillColor="rgba(45, 212, 191, 0.35)"
          shape="square"
          hoverTrailAmount={5}
        />
      </div>

      <div className="relative w-full max-w-sm rounded-3xl bg-white/95 px-6 py-8 shadow-2xl shadow-black/30 backdrop-blur sm:px-8">
        <div className="flex justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md shadow-black/10 ring-1 ring-black/5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-5 w-5 text-neutral-900"
            >
              <rect
                x="3"
                y="7.5"
                width="18"
                height="12.5"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
        </div>

        <h1 className="mt-4 text-center font-display text-xl font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        <p className="mx-auto mt-1.5 max-w-xs text-center text-sm leading-relaxed text-slate-500">
          {subtitle}
        </p>

        <div className="mt-6">{children}</div>

        <div className="mt-5 text-center text-sm text-slate-500">{footer}</div>
      </div>
    </main>
  );
}

// Input auth dengan ikon kiri (seperti referensi: abu muda, rounded).
export function AuthField({
  id,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  right,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  icon: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex h-11 items-center gap-2.5 rounded-xl bg-slate-100 px-3.5 transition-colors duration-150 focus-within:bg-slate-200/70 focus-within:ring-2 focus-within:ring-teal-600">
      <span aria-hidden="true" className="shrink-0 text-slate-400">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      {right}
    </div>
  );
}
