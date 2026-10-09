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

export interface ReportComment {
  _id: string;
  content: string;
}

export interface ReportReview {
  _id: string;
  rating: number;
  content?: string;
  page?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export interface ReportMessage {
  _id: string;
  body: string;
}

export interface ReportConversation {
  _id: string;
  lastMessage?: { text?: string };
}

export interface ApiReport {
  _id: string;
  reporter: ReportReporter | string;
  post?: ReportPost | string | null;
  comment?: ReportComment | string | null;
  review?: ReportReview | string | null;
  message?: ReportMessage | string | null;
  conversation?: ReportConversation | string | null;
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
