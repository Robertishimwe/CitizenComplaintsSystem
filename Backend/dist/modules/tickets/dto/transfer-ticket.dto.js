"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferTicketSchema = void 0;
const zod_1 = require("zod");
exports.TransferTicketSchema = zod_1.z.object({
    params: zod_1.z.object({
        ticketId: zod_1.z.string().cuid('Invalid ticket ID format'),
    }),
    body: zod_1.z.object({
        newAgencyId: zod_1.z.string().cuid('New agency ID must be a valid CUID.'),
        transferComment: zod_1.z.string().optional(), // Optional comment from the agent initiating transfer
    }),
});
