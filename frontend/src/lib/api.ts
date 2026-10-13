export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

/** Header bersama: token localStorage + Content-Type JSON. */
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

/**
 * Versi `apiFetch` yang juga mengembalikan kode HTTP, untuk aksi yang
 * wajib membedakan status, misalnya POST /jobs/:id/apply yang membalas
 * 409 saat lamaran sudah ada. `apiFetch` sendiri sengaja dibiarkan apa
 * adanya (hanya melempar error jaringan, body JSON selalu dikembalikan)
 * supaya pola `data.success` + `data.message` di seluruh halaman lain
 * tidak berubah.
 *
 * Body non-JSON (proxy/timeout/502) dibungkus jadi objek kosong supaya
 * pemanggil tetap bisa bercabang di `status` alih-alih melempar error
 * baru yang tidak ada di kontrak backend.
 */
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
