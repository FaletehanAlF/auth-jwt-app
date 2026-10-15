import type { ReactNode } from "react";

export default function ForgotPasswordTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="animate-jobtrack-page h-dvh overflow-hidden overscroll-none">
      {children}
    </div>
  );
}
