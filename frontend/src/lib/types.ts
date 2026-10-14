export type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  company: string;
  created_at?: string;
};

export type Application = {
  id: number;
  job_id: number;
  title: string;
  company: string;
  location: string;
  description?: string;
  status?: string;
  created_at?: string;
};

export type Applicant = {
  id: number;
  job_id: number;
  jobseeker_id: number;
  status?: string;
  created_at?: string;
  name?: string;
  email?: string;
  jobseeker_name?: string;
  jobseeker_email?: string;
  has_cv?: boolean | number;
};
