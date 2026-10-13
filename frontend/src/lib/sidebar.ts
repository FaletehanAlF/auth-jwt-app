const STORAGE_KEY = "app-sidebar-collapsed";

/**
 * State sidebar (diciutkan / dibentangkan) disimpan di localStorage,
 * bukan di useState AppShell.
 *
 * Setiap halaman dashboard merender <AppShell> sendiri-sendiri
 * (/home, /lowongan, /profile, ...), sehingga navigasi client-side
 * akan unmount shell lama dan mount yang baru. Kalau state hanya
 * hidup di memori, pilihan "Ciutkan" hilang begitu pengguna pindah
 * halaman — sidebar melebar lagi. Disimpan persistent, jadi state
 * yang sama berlaku lintas halaman dan lintas reload.
 *
 * Semua akses dibungkus try/catch: localStorage bisa melempar
 * (mode privat / storage dinonaktifkan / kuota penuh) dan shell
 * tidak boleh gagal render hanya karena panel ingin disimpan.
 */
export function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Menyimpan state sidebar. Nilai di luar "1"/"0" diabaikan. */
export function writeSidebarCollapsed(collapsed: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  } catch {
    /* abaikan: storage tak tersedia — sidebar tetap bisa dipakai */
  }
}
