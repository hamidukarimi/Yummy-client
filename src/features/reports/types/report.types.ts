export type ReportReason = "spam" | "inappropriate" | "misleading" | "other";
export type ReportStatus = "pending" | "reviewed";

export interface ReportReporter {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
}

export interface ReportPost {
  _id: string;
  title?: string;
  content: string;
  type: string;
  images: string[];
  status: string;
  isPublished: boolean;
  page?: {
    _id: string;
    name: string;
    slug: string;
    avatar?: string;
  };
}

export interface ApiReport {
  _id: string;
  reporter: ReportReporter | string;
  post: ReportPost | string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReports {
  reports: ApiReport[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateReportPayload {
  reason: ReportReason;
  details?: string;
}
