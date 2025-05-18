"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingRuleRepository = void 0;
// src/modules/routingRules/routing-rule.repository.ts
const prisma_1 = __importDefault(require("@/config/prisma"));
const client_1 = require("@prisma/client");
class RoutingRuleRepository {
    constructor() {
        this.includeClause = {
            category: { select: { id: true, name: true } },
            assignedAgency: { select: { id: true, name: true, description: true } },
        };
    }
    async create(data) {
        return prisma_1.default.routingRule.create({
            data: {
                categoryId: data.categoryId,
                assignedAgencyId: data.assignedAgencyId,
                description: data.description,
                status: data.status || client_1.ResourceStatus.ACTIVE,
            },
            include: this.includeClause,
        });
    }
    async findById(id) {
        return prisma_1.default.routingRule.findUnique({
            where: { id },
            include: this.includeClause,
        });
    }
    async findByCategoryId(categoryId) {
        // A category can only have one routing rule due to unique constraint on categoryId
        return prisma_1.default.routingRule.findUnique({
            where: { categoryId },
            include: this.includeClause,
        });
    }
    async findAll(filters, pagination, sorting) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.agencyId)
            where.assignedAgencyId = filters.agencyId;
        if (filters.categoryId)
            where.categoryId = filters.categoryId;
        const routingRules = await prisma_1.default.routingRule.findMany({
            where,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: {
                [sorting.sortBy]: sorting.sortOrder, // e.g., category: { name: sorting.sortOrder } if sorting by related field
            },
            include: this.includeClause,
        });
        const total = await prisma_1.default.routingRule.count({ where });
        return { routingRules, total };
    }
    async update(id, data) {
        const updateData = {};
        if (data.assignedAgencyId !== undefined)
            updateData.assignedAgency = { connect: { id: data.assignedAgencyId } };
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (Object.keys(updateData).length === 0) {
            return this.findById(id);
        }
        return prisma_1.default.routingRule.update({
            where: { id },
            data: updateData,
            include: this.includeClause,
        });
    }
    async delete(id) {
        // Deleting a routing rule doesn't affect Categories or Agencies directly,
        // as the rule itself is the link.
        // Prisma schema: if Category or Agency is deleted, rule is deleted (onDelete: Cascade).
        return prisma_1.default.routingRule.delete({
            where: { id },
        });
    }
}
exports.RoutingRuleRepository = RoutingRuleRepository;
