import type { ReactNode } from "react";
import AuthTemplate from "../../components/auth/AuthTemplate";

export default function LoginTemplate({ children }: { children: ReactNode }) {
  return <AuthTemplate>{children}</AuthTemplate>;
}
