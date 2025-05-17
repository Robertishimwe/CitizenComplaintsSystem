// src/modules/tickets/enums/ticket.enums.ts
export enum TicketStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS_PENDING_AGENT = 'IN_PROGRESS_PENDING_AGENT',
  IN_PROGRESS_PENDING_CITIZEN = 'IN_PROGRESS_PENDING_CITIZEN',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}
