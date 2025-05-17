// src/modules/routingRules/routing-rule.repository.ts
import prisma from '@/config/prisma';
import { Prisma, RoutingRule, ResourceStatus } from '@prisma/client';
import {
  CreateRoutingRulePayload,
  UpdateRoutingRulePayload,
  RoutingRuleFilter,
} from './interfaces/routing-rule.interfaces';

// Define a type for RoutingRule with its relations
export type RoutingRuleWithRelations = Prisma.RoutingRuleGetPayload<{
  include: {
    category: { select: { id: true; name: true } };
    assignedAgency: { select: { id: true; name: true } };
  };
}>;

export class RoutingRuleRepository {
  private readonly includeClause = {
    category: { select: { id: true, name: true } },
    assignedAgency: { select: { id: true, name: true, description:true } },
  };

  async create(data: CreateRoutingRulePayload): Promise<RoutingRuleWithRelations> {
    return prisma.routingRule.create({
      data: {
        categoryId: data.categoryId,
        assignedAgencyId: data.assignedAgencyId,
        description: data.description,
        status: data.status || ResourceStatus.ACTIVE,
      },
      include: this.includeClause,
    });
  }

  async findById(id: string): Promise<RoutingRuleWithRelations | null> {
    return prisma.routingRule.findUnique({
      where: { id },
      include: this.includeClause,
    });
  }

  async findByCategoryId(categoryId: string): Promise<RoutingRuleWithRelations | null> {
    // A category can only have one routing rule due to unique constraint on categoryId
    return prisma.routingRule.findUnique({
      where: { categoryId },
      include: this.includeClause,
    });
  }

  async findAll(
    filters: RoutingRuleFilter,
    pagination: { skip: number; take: number },
    sorting: { sortBy: string; sortOrder: 'asc' | 'desc' }
  ): Promise<{ routingRules: RoutingRuleWithRelations[]; total: number }> {
    const where: Prisma.RoutingRuleWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.agencyId) where.assignedAgencyId = filters.agencyId;
    if (filters.categoryId) where.categoryId = filters.categoryId;

    const routingRules = await prisma.routingRule.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        [sorting.sortBy]: sorting.sortOrder, // e.g., category: { name: sorting.sortOrder } if sorting by related field
      },
      include: this.includeClause,
    });

    const total = await prisma.routingRule.count({ where });
    return { routingRules, total };
  }

  async update(id: string, data: UpdateRoutingRulePayload): Promise<RoutingRuleWithRelations | null> {
    const updateData: Prisma.RoutingRuleUpdateInput = {};
    if (data.assignedAgencyId !== undefined) updateData.assignedAgency = { connect: { id: data.assignedAgencyId } };
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    if (Object.keys(updateData).length === 0) {
        return this.findById(id);
    }

    return prisma.routingRule.update({
      where: { id },
      data: updateData,
      include: this.includeClause,
    });
  }

  async delete(id: string): Promise<RoutingRule | null> {
    // Deleting a routing rule doesn't affect Categories or Agencies directly,
    // as the rule itself is the link.
    // Prisma schema: if Category or Agency is deleted, rule is deleted (onDelete: Cascade).
    return prisma.routingRule.delete({
      where: { id },
    });
  }
}
