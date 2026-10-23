import type { ReactNode } from "react";
import AuthTemplate from "../../components/auth/AuthTemplate";

export default function ResetPasswordTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthTemplate>{children}</AuthTemplate>;
}
