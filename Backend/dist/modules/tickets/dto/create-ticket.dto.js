"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTicketSchema = void 0;
const zod_1 = require("zod");
const ticket_enums_1 = require("../enums/ticket.enums"); // Use local enum
exports.CreateTicketSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5, 'Title must be at least 5 characters long').trim(),
        categoryId: zod_1.z.string().cuid('Invalid category ID format').nullable().optional(), // Optional for AI suggestion
        location: zod_1.z.string().min(5, 'Location description is too short').trim(),
        priority: zod_1.z.nativeEnum(ticket_enums_1.TicketPriority).optional().default(ticket_enums_1.TicketPriority.MEDIUM),
        detailedDescription: zod_1.z.string().min(10, 'Detailed description must be at least 10 characters long').trim(),
        // For anonymous submissions (if user is not logged in)
        isAnonymous: zod_1.z.boolean().optional().default(false),
        anonymousCreatorName: zod_1.z.string().trim().optional(),
        anonymousCreatorContact: zod_1.z.string().trim().optional(), // Could be email or phone
    }).refine(data => {
        if (data.isAnonymous && (!data.anonymousCreatorName || !data.anonymousCreatorContact)) {
            return false; // Require name and contact if anonymous
        }
        return true;
    }, {
        message: 'Anonymous submissions require a name and contact information.',
        path: ['anonymousCreatorName'], // Or a general path
    }),
});
