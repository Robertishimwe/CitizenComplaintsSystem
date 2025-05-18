"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgencyRepository = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const client_1 = require("@prisma/client");
class AgencyRepository {
    async create(data) {
        return prisma_1.default.agency.create({
            data: {
                name: data.name,
                description: data.description,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                status: data.status || client_1.ResourceStatus.ACTIVE,
            },
        });
    }
    async findById(id) {
        return prisma_1.default.agency.findUnique({
            where: { id },
            // include: { staffMembers: true } // Optionally include related data
        });
    }
    async findByName(name) {
        return prisma_1.default.agency.findUnique({
            where: { name },
        });
    }
    async findAll(filters, pagination, sorting) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const agencies = await prisma_1.default.agency.findMany({
            where,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: {
                [sorting.sortBy]: sorting.sortOrder,
            },
        });
        const total = await prisma_1.default.agency.count({ where });
        return { agencies, total };
    }
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.contactEmail !== undefined)
            updateData.contactEmail = data.contactEmail;
        // Handle setting contactPhone to null or a new value
        if (data.contactPhone === null) {
            updateData.contactPhone = null;
        }
        else if (data.contactPhone !== undefined) {
            updateData.contactPhone = data.contactPhone;
        }
        if (data.status !== undefined)
            updateData.status = data.status;
        if (Object.keys(updateData).length === 0) {
            return this.findById(id); // No actual fields to update
        }
        return prisma_1.default.agency.update({
            where: { id },
            data: updateData,
        });
    }
    async delete(id) {
        // Consider implications: what happens to staff, routing rules, tickets assigned to this agency?
        // Prisma schema onDelete rules will handle some of this.
        // Soft delete (setting status to INACTIVE) is often preferred.
        // For now, implementing as a status change to INACTIVE.
        // If hard delete is needed, ensure cascading rules in schema.prisma are set appropriately or handle related entities manually.
        const agency = await this.findById(id);
        if (!agency)
            return null;
        return prisma_1.default.agency.update({
            where: { id },
            data: { status: client_1.ResourceStatus.INACTIVE }
        });
        // For hard delete:
        // return prisma.agency.delete({ where: { id } });
    }
}
exports.AgencyRepository = AgencyRepository;
