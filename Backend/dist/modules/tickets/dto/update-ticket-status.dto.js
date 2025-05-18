"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTicketByAgentSchema = void 0;
const zod_1 = require("zod");
const ticket_enums_1 = require("../enums/ticket.enums");
exports.UpdateTicketByAgentSchema = zod_1.z.object({
    params: zod_1.z.object({
        ticketId: zod_1.z.string().cuid('Invalid ticket ID format'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(ticket_enums_1.TicketStatus).optional(),
        priority: zod_1.z.nativeEnum(ticket_enums_1.TicketPriority).optional(),
        // More fields can be added as needed for agent updates
        // e.g., internal notes, resolution details
    }),
});
