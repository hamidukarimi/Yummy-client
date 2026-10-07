// ─── Working Hours ────────────────────────────────────────────────────────────

export interface WorkingHoursDay {
  open:     string;
  close:    string;
  isClosed: boolean;
}

export interface WorkingHours {
  monday:    WorkingHoursDay;
  tuesday:   WorkingHoursDay;
  wednesday: WorkingHoursDay;
  thursday:  WorkingHoursDay;
  friday:    WorkingHoursDay;
  saturday:  WorkingHoursDay;
  sunday:    WorkingHoursDay;
}

// ─── Owner (populated) ────────────────────────────────────────────────────────

export interface PageOwner {
  id:        string;
  firstname: string;
  lastname:  string;
  username:  string;
  avatar?:   string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export type PageVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface ApiPage {
  id:           string;
  _id:          string;
  owner:        string | PageOwner;
  name:         string;
  slug:         string;
  description?: string;
  avatar?:      string;
  coverImage?:  string;
  category:     string;
  tags:         string[];
  phone?:       string;
  website?:     string;
  location?: {
    address?: string;
    city?:    string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  distanceKm?: number;
  workingHours: WorkingHours;
  isVerified:   boolean;
  verificationStatus: PageVerificationStatus;
  verificationRequestedAt?: string;
  verificationReviewedAt?: string;
  verificationRejectionReason?: string;
  isActive:     boolean;
  followers:    string[];
  createdAt:    string;
  updatedAt:    string;
}

// ─── Page View Response ───────────────────────────────────────────────────────

export interface PageViewData {
  page:           ApiPage;
  followersCount: number;
  isFollowing:    boolean;
  isOwner:        boolean;
}

export interface PaginatedVerificationRequests {
  pages: ApiPage[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Create Page Payload ──────────────────────────────────────────────────────

export interface CreatePagePayload {
  name:         string;
  category:     string;
  description?: string;
  phone?:       string;
  website?:     string;
  location?: {
    address?: string;
    city?:    string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  avatar?:      string;
  coverImage?:  string;
  tags?:        string[];
  workingHours?: WorkingHours;
}




export interface PaginatedPages {
  pages:      ApiPage[];
  total:      number;
  page:       number;
  totalPages: number;
}


export interface GetAllPagesParams {
  page?:     number;
  limit?:    number;
  category?: string;
  search?:   string;
  lat?:      number;
  lng?:      number;
  radiusKm?: number;
  openNow?:  boolean;
}


// Add to page.types.ts

export interface UpdatePagePayload {
  name?:        string;
  category?:    string;
  description?: string;
  avatar?:      string;
  coverImage?:  string;
  tags?:        string[];
  phone?:       string;
  website?:     string;
  location?: {
    address?: string;
    city?:    string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  workingHours?: WorkingHours;
}