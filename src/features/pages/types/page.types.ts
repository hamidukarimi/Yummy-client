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
  };
  workingHours: WorkingHours;
  isVerified:   boolean;
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
  };
  avatar?:      string;
  coverImage?:  string;
  tags?:        string[];
  workingHours?: WorkingHours;
}