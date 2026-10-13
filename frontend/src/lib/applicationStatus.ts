/**
 * Metadata status lamaran FASE 2 (frontend saja).
 * Satu sumber label + gaya badge agar tampilan jobseeker (badge baca)
 * dan recruiter (badge + kontrol ubah) tidak pernah berbeda.
 * Nilai mengikuti kontrak backend: pending, reviewed, interview,
 * accepted, rejected (lihat PATCH /api/applications/:id).
 */

export type ApplicationStatusValue = (typeof APPLICATION_STATUSES)[number]["value"];

export const APPLICATION_STATUSES: { value: string; label: string; badge: string }[] = [
  {
    value: "pending",
    label: "Menunggu",
    badge: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  },
  {
    value: "reviewed",
    label: "Sedang Ditinjau",
    badge: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/15",
  },
  {
    value: "interview",
    label: "Wawancara",
    badge: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20",
  },
  {
    value: "accepted",
    label: "Diterima",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  },
  {
    value: "rejected",
    label: "Ditolak",
    badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  },
];

/**
 * Status tak dikenal (mis. backend lama tanpa kolom status, atau nilai
 * baru yang belum didukung frontend) TIDAK boleh tampil sebagai sukses:
 * selalu jatuh ke badge netral "Status tidak diketahui".
 */
export function getStatusInfo(status?: string | null): { label: string; badge: string } {
  const found = APPLICATION_STATUSES.find((item) => item.value === status);
  if (found) return { label: found.label, badge: found.badge };
  return {
    label: status ? "Status tidak diketahui" : "Status belum tersedia",
    badge: "bg-slate-100 text-ink-500 ring-1 ring-inset ring-slate-200",
  };
}
