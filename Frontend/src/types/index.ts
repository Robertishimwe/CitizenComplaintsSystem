export type UserRole = "citizen" | "agency" | "admin";

export type TicketStatus = "new" | "assigned" | "in_progress_pending_agent" | "in_progress_pending_citizen" | "resolved" | "closed" | "reopened";

export type ApiTicketStatus = "NEW" | "ASSIGNED" | "IN_PROGRESS_PENDING_AGENT" | "IN_PROGRESS_PENDING_CITIZEN" | "RESOLVED" | "CLOSED" | "REOPENED";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type ApiTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  phone?: string;
  agency?: {
    id: string;
    name: string;
  };
}

export interface Agency {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone?: string;
  createdAt: Date;
  isActive: boolean;
  status?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  isActive: boolean;
}

export interface RoutingRule {
  id: string;
  categoryId: string;
  agencyId: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  submitterId: string;
  assignedAgencyId?: string;
  assignedAgency?: {
    id: string;
    name: string;
  };
  assignedAgentId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  location?: string;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  detailedDescription?: string; // Added to match API response
  citizen?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  communications?: Communication[];
}

export interface Communication {
  id: string;
  message: string;
  timestamp: string;
  isInternal: boolean;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  content: string;
  attachments?: Attachment[];
  createdAt: Date;
  isInternal: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  ticketId?: string;
  messageId?: string;
  uploadedBy: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  averageResolutionTime: number; // in hours
  ticketsByCategory: {
    categoryName: string;
    count: number;
  }[];
  ticketsByStatus: {
    status: TicketStatus;
    count: number;
  }[];
  ticketsByPriority: {
    priority: TicketPriority;
    count: number;
  }[];
  ticketTrend: {
    date: string;
    count: number;
  }[];
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Helper Types
export interface SelectOption {
  label: string;
  value: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage?: number;
    perPage?: number;
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface StatusUpdateRequest {
  status: ApiTicketStatus;
  priority: ApiTicketPriority;
}

export interface TransferTicketRequest {
  newAgencyId: string;
  transferComment: string;
}

export interface AssignAgentRequest {
  assignedAgentId: string;
}
