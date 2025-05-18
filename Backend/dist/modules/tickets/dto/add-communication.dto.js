"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCommunicationSchema = void 0;
const zod_1 = require("zod");
exports.AddCommunicationSchema = zod_1.z.object({
    params: zod_1.z.object({
        ticketId: zod_1.z.string().cuid('Invalid ticket ID format'),
    }),
    body: zod_1.z.object({
        message: zod_1.z.string().min(1, 'Message cannot be empty').trim(),
        isInternal: zod_1.z.boolean().optional().default(false), // For agency staff internal notes
    }),
});
