import { Agency as PrismaAgency, ResourceStatus } from '@prisma/client';

// For API responses, we might not need to transform PrismaAgency much
export type AgencyResponse = PrismaAgency;

export interface CreateAgencyPayload {
  name: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  status?: ResourceStatus; // Admin can set status on creation, defaults to ACTIVE
}

export interface UpdateAgencyPayload {
  name?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string | null; // <--- MODIFIED HERE: Allow null
//   contactPhone?: string;
  status?: ResourceStatus;
}

export interface AgencyFilter {
  status?: ResourceStatus;
  search?: string; // For searching by name or description
}

export interface PaginatedAgenciesResponse {
  agencies: AgencyResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
