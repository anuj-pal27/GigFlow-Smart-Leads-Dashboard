export type UserRole = "admin" | "sales";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "lost";
export type LeadSource = "website" | "instagram" | "referral";

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedLeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
