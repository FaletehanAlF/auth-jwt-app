export type UserRole = "jobseeker" | "recruiter";

export function getRoleFromToken(): UserRole | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "recruiter" ? "recruiter" : "jobseeker";
  } catch {
    return null;
  }
}

export function isRecruiter(): boolean {
  return getRoleFromToken() === "recruiter";
}

export function getEmailFromToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}

export type TokenPayload = {
  id: number;
  email: string | null;
  role: UserRole;
  exp?: number;
};

export function getTokenPayload(): TokenPayload | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1])) as {
      id?: unknown;
      email?: unknown;
      role?: unknown;
      exp?: unknown;
    };
    if (typeof payload.id !== "number" && typeof payload.id !== "string") {
      return null;
    }
    return {
      id: Number(payload.id),
      email: typeof payload.email === "string" ? payload.email : null,
      role: payload.role === "recruiter" ? "recruiter" : "jobseeker",
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}

export function isPayloadExpired(payload: TokenPayload): boolean {
  return payload.exp !== undefined && payload.exp * 1000 <= Date.now();
}
