import type { ReactNode } from "react";

export default function RegisterTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="animate-jobtrack-page h-dvh overflow-x-hidden lg:overflow-y-hidden">
      {children}
    </div>
  );
}
