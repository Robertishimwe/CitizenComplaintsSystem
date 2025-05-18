"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRepository = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const client_1 = require("@prisma/client");
class TicketRepository {
    constructor() {
        this.ticketIncludeClause = {
            citizen: { select: { id: true, name: true, email: true, phone: true } },
            assignedAgent: { select: { id: true, name: true, email: true } },
            assignedAgency: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
            communications: {
                include: {
                    sender: { select: { id: true, name: true, role: true } }, // Include sender's role
                },
                orderBy: { timestamp: 'asc' },
            },
        };
    }
    // async create(data: CreateTicketPayload, assignedAgencyId?: string): Promise<TicketWithDetails> {
    //   console.log(">>>>>>>>>", data)
    //   const createData: Prisma.TicketCreateInput = {
    //     title: data.title,
    //     location: data.location,
    //     priority: data.priority || TicketPriority.MEDIUM,
    //     detailedDescription: data.detailedDescription,
    //     // status: TicketStatus.NEW, // Initial status
    //     status: data.status,
    //     isAnonymous: data.isAnonymous || false,
    //      assignedAgency: data.assignedAgencyId ? { connect: { id: data.assignedAgencyId } } : undefined };
    //   if (data.isAnonymous) {
    //     createData.anonymousCreatorName = data.anonymousCreatorName;
    //     createData.anonymousCreatorContact = data.anonymousCreatorContact;
    //   } else if (data.citizenId) {
    //     createData.citizen = { connect: { id: data.citizenId } };
    //   }
    //   if (data.categoryId) {
    //     createData.category = { connect: { id: data.categoryId } };
    //   }
    //   if (assignedAgencyId) {
    //     createData.assignedAgency = { connect: { id: assignedAgencyId } };
    //     // Status might change to ASSIGNED if an agency is immediately identified
    //     // Or keep NEW and let an admin/agent assign it. For now, let's keep NEW.
    //   }
    //   return prisma.ticket.create({
    //     data: createData,
    //     include: this.ticketIncludeClause,
    //   });
    // }
    async create(data) {
        const createData = {
            title: data.title,
            location: data.location,
            priority: data.priority || client_1.TicketPriority.MEDIUM,
            detailedDescription: data.detailedDescription,
            status: data.status || client_1.TicketStatus.NEW, // Use status from payload, default to NEW
            isAnonymous: data.isAnonymous || false,
        };
        if (data.isAnonymous) {
            createData.anonymousCreatorName = data.anonymousCreatorName;
            createData.anonymousCreatorContact = data.anonymousCreatorContact;
        }
        else if (data.citizenId) {
            createData.citizen = { connect: { id: data.citizenId } };
        }
        if (data.categoryId) {
            createData.category = { connect: { id: data.categoryId } };
        }
        // Use assignedAgencyId from the payload
        if (data.assignedAgencyId) {
            createData.assignedAgency = { connect: { id: data.assignedAgencyId } };
        }
        return prisma_1.default.ticket.create({
            data: createData,
            include: this.ticketIncludeClause,
        });
    }
    async findById(id) {
        return prisma_1.default.ticket.findUnique({
            where: { id },
            include: this.ticketIncludeClause,
        });
    }
    async findAll(filters, pagination, sorting, requestingUser // For ACL
    ) {
        const where = {};
        if (filters.status && filters.status.length > 0)
            where.status = { in: filters.status };
        if (filters.priority)
            where.priority = filters.priority;
        if (filters.assignedAgencyId)
            where.assignedAgencyId = filters.assignedAgencyId;
        if (filters.assignedAgentId)
            where.assignedAgentId = filters.assignedAgentId;
        if (filters.categoryId)
            where.categoryId = filters.categoryId;
        if (filters.isAnonymous !== undefined)
            where.isAnonymous = filters.isAnonymous;
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { detailedDescription: { contains: filters.search, mode: 'insensitive' } },
                { id: { contains: filters.search, mode: 'insensitive' } } // Allow search by ticket ID
            ];
        }
        // Access Control Logic
        if (requestingUser) {
            if (requestingUser.role === client_1.UserRole.CITIZEN) {
                where.citizenId = requestingUser.id; // Citizen sees only their own tickets
                where.isAnonymous = false; // And not anonymous ones unless logic changes
            }
            else if (requestingUser.role === client_1.UserRole.AGENCY_STAFF) {
                if (requestingUser.agencyId) {
                    where.assignedAgencyId = requestingUser.agencyId; // Agent sees tickets for their agency
                }
                else {
                    // Agent not assigned to any agency - should not happen or they see nothing
                    return { tickets: [], total: 0 };
                }
            }
            // ADMIN sees all (no additional where clause needed for admin based on user)
        }
        else if (filters.citizenId) { // If an admin is specifically filtering by citizenId
            where.citizenId = filters.citizenId;
        }
        const tickets = await prisma_1.default.ticket.findMany({
            where,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: {
                [sorting.sortBy]: sorting.sortOrder,
            },
            include: this.ticketIncludeClause,
        });
        const total = await prisma_1.default.ticket.count({ where });
        return { tickets, total };
    }
    async update(id, data) {
        const updateData = {};
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.priority !== undefined)
            updateData.priority = data.priority;
        if (data.categoryId !== undefined) {
            updateData.category = data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true };
        }
        if (data.assignedAgentId === null) { // Unassign agent
            updateData.assignedAgent = { disconnect: true };
        }
        else if (data.assignedAgentId !== undefined) { // Assign agent
            updateData.assignedAgent = { connect: { id: data.assignedAgentId } };
        }
        if (data.assignedAgencyId === null) { // Unassign agency (e.g. admin action)
            updateData.assignedAgency = { disconnect: true };
        }
        else if (data.assignedAgencyId !== undefined) { // Assign/transfer agency
            updateData.assignedAgency = { connect: { id: data.assignedAgencyId } };
        }
        if (Object.keys(updateData).length === 0) {
            return this.findById(id);
        }
        return prisma_1.default.ticket.update({
            where: { id },
            data: updateData,
            include: this.ticketIncludeClause,
        });
    }
    async addCommunication(data) {
        const commData = {
            message: data.message,
            isInternal: data.isInternal || false,
            ticket: { connect: { id: data.ticketId } },
        };
        if (data.senderId) {
            commData.sender = { connect: { id: data.senderId } };
        }
        return prisma_1.default.communication.create({
            data: commData,
            include: { sender: { select: { id: true, name: true, role: true } } }
        });
    }
    // Delete ticket (consider if this is allowed or if tickets are only closed/archived)
    // For now, a placeholder - a real delete is destructive.
    async delete(id) {
        // Ensure all communications are deleted first due to cascade or handle manually
        await prisma_1.default.communication.deleteMany({ where: { ticketId: id } });
        return prisma_1.default.ticket.delete({ where: { id } });
    }
}
exports.TicketRepository = TicketRepository;
