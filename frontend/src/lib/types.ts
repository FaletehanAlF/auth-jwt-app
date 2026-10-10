/**
 * Tipe respons API JobTrack (frontend saja, tanpa validasi runtime).
 * Bentuk disalin persis dari deklarasi lokal masing-masing halaman
 * dan kontrak SELECT backend; hanya dideduplikasi, tidak diubah.
 */

/** GET /jobs, GET /jobs/:id, GET /recruiter/jobs. */
export type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  company: string;
  created_at?: string;
};

/** GET /applications/me (join jobs). */
export type Application = {
  id: number;
  job_id: number;
  title: string;
  company: string;
  location: string;
  description?: string;
  created_at?: string;
};

/** GET /jobs/:id/applications (join users). */
export type Applicant = {
  id: number;
  job_id: number;
  jobseeker_id: number;
  created_at?: string;
  name?: string;
  email?: string;
  jobseeker_name?: string;
  jobseeker_email?: string;
};
