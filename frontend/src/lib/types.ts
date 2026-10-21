export type Job = {
  id: number;
  title: string;
  description: string;
  location: string;
  company: string;
  recruiter_id?: number;
  recruiter_name?: string;
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

export type InsightRangeKey = "7d" | "30d" | "90d" | "all";

export type InsightTrendPoint = {
  date: string;
  count: number;
};

export type InsightTopCompany = {
  company: string;
  applicationCount: number;
  jobCount: number;
};

export type InsightInDemandJob = {
  jobId: number;
  title: string;
  company: string;
  location: string;
  applicationCount: number;
  recentApplicationCount: number;
};

export type InsightPopularPosition = {
  title: string;
  applicationCount: number;
  jobCount: number;
};

export type InsightSummary = {
  totalApplications: number;
  availableJobs: number;
  companiesWithJobs: number;
  applicationsInRange: number;
  unknownDateCount: number;
};

export type InsightRange = {
  key: InsightRangeKey;
  start: string | null;
  end: string;
};

export type InsightResponse = {
  success: boolean;
  message?: string;
  generatedAt: string;
  range: InsightRange;
  summary: InsightSummary;
  trend: InsightTrendPoint[];
  topCompanies: InsightTopCompany[];
  inDemandJobs: InsightInDemandJob[];
  popularPositions: InsightPopularPosition[];
};
