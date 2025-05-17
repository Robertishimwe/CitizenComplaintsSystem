import { User as PrismaUser, UserRole, ResourceStatus } from '@prisma/client';

// You can extend PrismaUser if you need to add computed properties or modify types for responses
export interface UserResponse extends Omit<PrismaUser, 'password'> {
  // Add any additional computed fields here if needed for responses
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  phone: string; // Expecting 10 digits
  role: UserRole.ADMIN | UserRole.AGENCY_STAFF; // Only admin or agency staff
  agencyId?: string; // Required if role is AGENCY_STAFF
  password?: string; // Admin can set initial password, or it can be auto-generated
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: ResourceStatus;
  agencyId?: string | null; // Allow unassigning from agency
}

export interface UserFilter {
  role?: UserRole;
  status?: ResourceStatus;
  agencyId?: string;
  search?: string; // For searching by name or email
}

export interface PaginatedUsersResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
