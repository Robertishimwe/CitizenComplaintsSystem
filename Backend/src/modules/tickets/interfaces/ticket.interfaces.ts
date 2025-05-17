import {
  Ticket as PrismaTicket,
  Communication as PrismaCommunication,
  TicketStatus,
  TicketPriority,
  User,
  Agency,
  Category,
} from '@prisma/client';

// For API responses, include related data
export interface CommunicationResponse extends Omit<PrismaCommunication, 'senderId' | 'ticketId'> {
  sender?: { id: string; name: string; role: User['role'] } | { name: string }; // Simplified sender or anonymous
}

export interface TicketResponse extends Omit<PrismaTicket, 'citizenId' | 'assignedAgentId' | 'assignedAgencyId' | 'categoryId'> {
  citizen?: { id: string; name: string; email: string; phone: string } | { name: string; contact?: string }; // For registered or anonymous
  assignedAgent?: { id: string; name: string; email: string } | null;
  assignedAgency?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
  communications?: CommunicationResponse[];
}


export interface CreateTicketPayload {
  title: string;
  location: string;
  priority?: TicketPriority;
  detailedDescription: string;
  categoryId?: string | null; // Can be null initially if AI will suggest
  // For registered citizen
  citizenId?: string;
  // For anonymous submission
  isAnonymous?: boolean;
  anonymousCreatorName?: string;
  anonymousCreatorContact?: string; // Phone or email
}

export interface UpdateTicketPayload { // For agent/admin updates
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedAgentId?: string | null; // Assign or unassign agent
  assignedAgencyId?: string | null; // For transfer or initial assignment by admin
  categoryId?: string | null; // If admin re-categorizes
}

export interface AddCommunicationPayload {
  ticketId: string;
  message: string;
  senderId?: string; // For registered user (citizen or agent)
  isInternal?: boolean; // For agent internal notes
  // For anonymous replies, sender info might come from context or be implicit
}

export interface TicketFilter {
  status?: TicketStatus[]; // Allow filtering by multiple statuses
  priority?: TicketPriority;
  assignedAgencyId?: string;
  assignedAgentId?: string;
  citizenId?: string; // If admin/agent is viewing specific citizen's tickets
  categoryId?: string;
  search?: string; // Search in title or description
  isAnonymous?: boolean;
}

export interface PaginatedTicketsResponse {
  tickets: TicketResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransferTicketPayload {
    newAgencyId: string;
    // Optional: a comment/reason for transfer
    transferComment?: string;
}
