"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingRuleService = void 0;
const routing_rule_repository_1 = require("./routing-rule.repository");
const ApiError_1 = require("@/utils/ApiError");
const prisma_1 = __importDefault(require("@/config/prisma")); // For checking existence of Category and Agency
const client_1 = require("@prisma/client");
class RoutingRuleService {
    constructor() {
        this.ruleRepository = new routing_rule_repository_1.RoutingRuleRepository();
    }
    mapToResponse(rule) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { categoryId, assignedAgencyId, ...rest } = rule; // Prisma types might not have these if using include correctly
        return {
            ...rest, // id, description, status, createdAt, updatedAt
            category: rule.category,
            assignedAgency: rule.assignedAgency,
        };
    }
    async createRule(dto) {
        // Check if Category exists
        const categoryExists = await prisma_1.default.category.findUnique({ where: { id: dto.categoryId } });
        if (!categoryExists) {
            throw new ApiError_1.ApiError(404, `Category with ID "${dto.categoryId}" not found.`);
        }
        // Check if Agency exists
        const agencyExists = await prisma_1.default.agency.findUnique({ where: { id: dto.assignedAgencyId } });
        if (!agencyExists) {
            throw new ApiError_1.ApiError(404, `Agency with ID "${dto.assignedAgencyId}" not found.`);
        }
        if (agencyExists.status === client_1.ResourceStatus.INACTIVE) {
            throw new ApiError_1.ApiError(400, `Cannot assign to an inactive agency: "${agencyExists.name}".`);
        }
        // Check if a rule for this category already exists (unique constraint on categoryId)
        const existingRule = await this.ruleRepository.findByCategoryId(dto.categoryId);
        if (existingRule) {
            throw new ApiError_1.ApiError(409, `A routing rule already exists for category "${categoryExists.name}". Please update the existing rule (ID: ${existingRule.id}).`);
        }
        const payload = { ...dto };
        const newRule = await this.ruleRepository.create(payload);
        return this.mapToResponse(newRule);
    }
    async getRuleById(id) {
        const rule = await this.ruleRepository.findById(id);
        return rule ? this.mapToResponse(rule) : null;
    }
    async listRules(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filters = {
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
    async updateRule(id, dto) {
        const ruleToUpdate = await this.ruleRepository.findById(id);
        if (!ruleToUpdate) {
            throw new ApiError_1.ApiError(404, 'Routing rule not found.');
        }
        // If updating assignedAgencyId, check if the new agency exists and is active
        if (dto.assignedAgencyId) {
            const agencyExists = await prisma_1.default.agency.findUnique({ where: { id: dto.assignedAgencyId } });
            if (!agencyExists) {
                throw new ApiError_1.ApiError(404, `New agency with ID "${dto.assignedAgencyId}" not found.`);
            }
            if (agencyExists.status === client_1.ResourceStatus.INACTIVE) {
                throw new ApiError_1.ApiError(400, `Cannot assign to an inactive agency: "${agencyExists.name}".`);
            }
        }
        const payload = { ...dto };
        const updatedRule = await this.ruleRepository.update(id, payload);
        return updatedRule ? this.mapToResponse(updatedRule) : null;
    }
    async deleteRule(id) {
        const rule = await this.ruleRepository.findById(id);
        if (!rule) {
            throw new ApiError_1.ApiError(404, 'Routing rule not found.');
        }
        const deletedRule = await this.ruleRepository.delete(id);
        if (!deletedRule)
            return null; // Should not happen if findById worked
        return { id: deletedRule.id, message: 'Routing rule deleted successfully.' };
    }
}
exports.RoutingRuleService = RoutingRuleService;
