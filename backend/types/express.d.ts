declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: "jobseeker" | "recruiter";
      };
    }
  }
}

export {};
