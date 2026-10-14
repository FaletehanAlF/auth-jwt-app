export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function buildHeaders(init?: RequestInit): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });
  return response.json() as Promise<T>;
}

export async function apiFetchWithStatus<T>(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; data: T }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch {
    data = {} as T;
  }

  return { status: response.status, data };
}

export async function apiFetchBlob(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; blob: Blob | null; message?: string }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });

  if (!response.ok) {
    let message: string | undefined;
    try {
      const data = (await response.json()) as { message?: string };
      message = data?.message;
    } catch {
    }
    return { ok: false, status: response.status, blob: null, message };
  }

  const blob = await response.blob();
  return { ok: true, status: response.status, blob };
}
