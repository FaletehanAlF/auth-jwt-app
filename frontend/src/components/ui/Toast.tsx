"use client";

export type ToastKind = "success" | "error";

export interface ToastData {
  id: number;
  kind: ToastKind;
  message: string;
}

export default function Toast({ toast }: { toast: ToastData | null }) {
  if (!toast) {
    return null;
  }

  const isError = toast.kind === "error";

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div
        key={toast.id}
        role={isError ? "alert" : "status"}
        className={`animate-toast-in flex max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-snug shadow-xl shadow-black/20 ${
          isError
            ? "border-red-200 bg-white text-red-700"
            : "border-white/10 bg-neutral-900 text-white"
        }`}
      >
        {isError ? (
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0"
          >
            <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10 6.5v4.2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="10" cy="13.4" r="1" fill="currentColor" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
          >
            <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="m7 10.2 2.2 2.2L13.2 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
