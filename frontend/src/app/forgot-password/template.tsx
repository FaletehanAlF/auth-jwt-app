import type { ReactNode } from "react";
import AuthTemplate from "../../components/auth/AuthTemplate";

export default function ForgotPasswordTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthTemplate>{children}</AuthTemplate>;
}
