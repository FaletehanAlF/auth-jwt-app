// Base URL backend. Di-override via env agar "menyesuaikan"
// tanpa harus edit kode di setiap halaman.
//
// .env.local:
//   NEXT_PUBLIC_API_URL=http://localhost:5001/api
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  return response.json() as Promise<T>;
}
