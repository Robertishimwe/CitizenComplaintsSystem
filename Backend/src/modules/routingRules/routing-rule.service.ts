import { RoutingRuleRepository, RoutingRuleWithRelations } from './routing-rule.repository';
import { CreateRoutingRuleDto, UpdateRoutingRuleDto, ListRoutingRulesQueryDto } from './dto';
import {
  RoutingRuleResponse,
  PaginatedRoutingRulesResponse,
  RoutingRuleFilter,
  CreateRoutingRulePayload,
  UpdateRoutingRulePayload,
} from './interfaces/routing-rule.interfaces';
import { ApiError } from '@/utils/ApiError';
import prisma from '@/config/prisma'; // For checking existence of Category and Agency
import { ResourceStatus } from '@prisma/client';

export class RoutingRuleService {
  private ruleRepository: RoutingRuleRepository;

  constructor() {
    this.ruleRepository = new RoutingRuleRepository();
  }

  private mapToResponse(rule: RoutingRuleWithRelations): RoutingRuleResponse {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categoryId, assignedAgencyId, ...rest } = rule; // Prisma types might not have these if using include correctly
    return {
      ...rest, // id, description, status, createdAt, updatedAt
      category: rule.category,
      assignedAgency: rule.assignedAgency,
    };
  }

  async createRule(dto: CreateRoutingRuleDto): Promise<RoutingRuleResponse> {
    // Check if Category exists
    const categoryExists = await prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!categoryExists) {
      throw new ApiError(404, `Category with ID "${dto.categoryId}" not found.`);
    }

    // Check if Agency exists
    const agencyExists = await prisma.agency.findUnique({ where: { id: dto.assignedAgencyId } });
    if (!agencyExists) {
      throw new ApiError(404, `Agency with ID "${dto.assignedAgencyId}" not found.`);
    }
    if (agencyExists.status === ResourceStatus.INACTIVE) {
        throw new ApiError(400, `Cannot assign to an inactive agency: "${agencyExists.name}".`);
    }


    // Check if a rule for this category already exists (unique constraint on categoryId)
    const existingRule = await this.ruleRepository.findByCategoryId(dto.categoryId);
    if (existingRule) {
      throw new ApiError(409, `A routing rule already exists for category "${categoryExists.name}". Please update the existing rule (ID: ${existingRule.id}).`);
    }

    const payload: CreateRoutingRulePayload = { ...dto };
    const newRule = await this.ruleRepository.create(payload);
    return this.mapToResponse(newRule);
  }

  async getRuleById(id: string): Promise<RoutingRuleResponse | null> {
    const rule = await this.ruleRepository.findById(id);
    return rule ? this.mapToResponse(rule) : null;
  }

  async listRules(query: ListRoutingRulesQueryDto): Promise<PaginatedRoutingRulesResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filters: RoutingRuleFilter = {
      status: query.status,
      agencyId: query.agencyId,
      categoryId: query.categoryId,
    };
    const sorting = {
      sortBy: query.sortBy || 'createdAt', // Add more complex sorting later if needed (e.g., by category.name)
      sortOrder: query.sortOrder || 'desc',
    };

    const { routingRules, total } = await this.ruleRepository.findAll(filters, { skip, take: limit }, sorting);

    return {
      routingRules: routingRules.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateRule(id: string, dto: UpdateRoutingRuleDto): Promise<RoutingRuleResponse | null> {
    const ruleToUpdate = await this.ruleRepository.findById(id);
    if (!ruleToUpdate) {
      throw new ApiError(404, 'Routing rule not found.');
    }

    // If updating assignedAgencyId, check if the new agency exists and is active
    if (dto.assignedAgencyId) {
      const agencyExists = await prisma.agency.findUnique({ where: { id: dto.assignedAgencyId } });
      if (!agencyExists) {
        throw new ApiError(404, `New agency with ID "${dto.assignedAgencyId}" not found.`);
      }
      if (agencyExists.status === ResourceStatus.INACTIVE) {
        throw new ApiError(400, `Cannot assign to an inactive agency: "${agencyExists.name}".`);
      }
    }

    const payload: UpdateRoutingRulePayload = { ...dto };
    const updatedRule = await this.ruleRepository.update(id, payload);
    return updatedRule ? this.mapToResponse(updatedRule) : null;
  }

  async deleteRule(id: string): Promise<{ id: string; message: string } | null> {
    const rule = await this.ruleRepository.findById(id);
    if (!rule) {
        throw new ApiError(404, 'Routing rule not found.');
    }
    const deletedRule = await this.ruleRepository.delete(id);
    if (!deletedRule) return null; // Should not happen if findById worked
    return { id: deletedRule.id, message: 'Routing rule deleted successfully.'};
  }
}
