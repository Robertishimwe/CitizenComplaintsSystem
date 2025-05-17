import { RoutingRule as PrismaRoutingRule, ResourceStatus, Category, Agency } from '@prisma/client';

// For API responses, include Category and Agency details
export interface RoutingRuleResponse extends Omit<PrismaRoutingRule, 'categoryId' | 'assignedAgencyId'> {
  category: { id: string; name: string };
  assignedAgency: { id: string; name: string };
}

export interface CreateRoutingRulePayload {
  categoryId: string;
  assignedAgencyId: string;
  description?: string;
  status?: ResourceStatus;
}

export interface UpdateRoutingRulePayload {
  assignedAgencyId?: string;
  description?: string;
  status?: ResourceStatus;
  // categoryId typically should not be updatable for a rule; delete and create new if category changes.
}

export interface RoutingRuleFilter {
  status?: ResourceStatus;
  agencyId?: string;
  categoryId?: string; // Though categoryId is unique on the rule, so this might just be for specific lookup
}

export interface PaginatedRoutingRulesResponse {
  routingRules: RoutingRuleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
