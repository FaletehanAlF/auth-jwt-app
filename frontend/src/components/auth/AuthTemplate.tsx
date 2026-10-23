import type { ReactNode } from "react";

/**
 * Pembungkus bersama untuk halaman auth (login, register, lupa & reset kata
 * sandi).
 *
 * Kenapa tidak memakai `h-dvh overflow-hidden` seperti sebelumnya: tinggi
 * form bisa melebihi viewport (layar pendek, keyboard ponsel terbuka). Dengan
 * `overflow-hidden` pada tinggi tetap, bagian bawah form — termasuk tombol
 * kirim — terpotong dan tidak bisa digulir. Di sini tinggi dibiarkan
 * mengikuti isi (min-h-dvh) sehingga halaman selalu bisa digulir.
 */
export default function AuthTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="animate-jobtrack-page min-h-dvh w-full max-w-full overflow-x-clip bg-neutral-50">
      {children}
    </div>
  );
}
