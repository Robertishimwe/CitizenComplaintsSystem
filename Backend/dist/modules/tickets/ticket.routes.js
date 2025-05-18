"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticket_controller_1 = require("./ticket.controller");
const validate_middleware_1 = require("@/middleware/validate.middleware");
const dto_1 = require("./dto");
const auth_middleware_1 = require("@/middleware/auth.middleware"); // protect populates req.user, requireAuth enforces it
const role_middleware_1 = require("@/middleware/role.middleware");
const user_enums_1 = require("@/modules/users/enums/user.enums");
const router = (0, express_1.Router)();
const ticketController = new ticket_controller_1.TicketController();
// POST /tickets - Create a new ticket (Citizen, or Anonymous if auth is optional for this route)
// `protect` middleware makes req.user available if token is sent, but doesn't require it.
// Service layer will differentiate between logged-in user and anonymous based on req.user and DTO.
router.post('/', 
// protect, // Apply protect globally in app.ts or here if needed for all ticket routes
(0, validate_middleware_1.validateBody)(dto_1.CreateTicketSchema.shape.body), ticketController.createTicket);
// GET /tickets - List tickets (access controlled in service based on role)
router.get('/', 
// protect, // Assuming protect is global, otherwise add here
(0, validate_middleware_1.validateQuery)(dto_1.ListTicketsQuerySchema.shape.query), ticketController.listTickets);
// GET /tickets/:ticketId - Get a specific ticket (access controlled in service)
router.get('/:ticketId', 
// protect,
(0, validate_middleware_1.validateParams)(dto_1.UpdateTicketByAgentSchema.shape.params), // Re-use params schema
ticketController.getTicketById);
// POST /tickets/:ticketId/communications - Add a communication to a ticket
router.post('/:ticketId/communications', 
// protect, // Needed to identify sender if not anonymous reply
(0, validate_middleware_1.validateParams)(dto_1.AddCommunicationSchema.shape.params), (0, validate_middleware_1.validateBody)(dto_1.AddCommunicationSchema.shape.body), ticketController.addCommunication);
// --- Routes requiring specific roles ---
// PATCH /tickets/:ticketId/status-update - Agent/Admin updates ticket status/priority
router.patch('/:ticketId/status-update', // More specific endpoint name
auth_middleware_1.requireAuth, // Must be logged in
(0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN, user_enums_1.UserRole.AGENCY_STAFF]), (req, res, next) => {
    const result = dto_1.UpdateTicketByAgentSchema.safeParse({ params: req.params, body: req.body });
    if (!result.success)
        return next(result.error);
    req.validatedParams = result.data.params;
    req.validatedBody = result.data.body;
    next();
}, ticketController.updateTicketByAgent);
// PATCH /tickets/:ticketId/assign - Admin assigns/unassigns an agent
router.patch('/:ticketId/assign', auth_middleware_1.requireAuth, (0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN, user_enums_1.UserRole.AGENCY_STAFF]), // Or more granular permissions later
(req, res, next) => {
    const result = dto_1.UpdateTicketAssignmentSchema.safeParse({ params: req.params, body: req.body });
    if (!result.success)
        return next(result.error);
    req.validatedParams = result.data.params;
    req.validatedBody = result.data.body;
    next();
}, ticketController.updateTicketAssignment);
// POST /tickets/:ticketId/transfer - Agent/Admin transfers ticket to another agency
router.post('/:ticketId/transfer', auth_middleware_1.requireAuth, (0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN, user_enums_1.UserRole.AGENCY_STAFF]), (req, res, next) => {
    const result = dto_1.TransferTicketSchema.safeParse({ params: req.params, body: req.body });
    if (!result.success)
        return next(result.error);
    req.validatedParams = result.data.params;
    req.validatedBody = result.data.body;
    next();
}, ticketController.transferTicket);
exports.default = router;
