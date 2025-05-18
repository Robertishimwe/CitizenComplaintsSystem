"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTicketAssignmentSchema = void 0;
const zod_1 = require("zod");
exports.UpdateTicketAssignmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        ticketId: zod_1.z.string().cuid('Invalid ticket ID format'),
    }),
    body: zod_1.z.object({
        assignedAgentId: zod_1.z.string().cuid('Invalid agent ID format').nullable().optional(), // Allow unassigning by setting to null
        // assignedAgencyId could also be here if admin can change it directly post-creation
    }),
});
