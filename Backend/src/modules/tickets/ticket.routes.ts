import { Router, Request, Response, NextFunction } from 'express';
import { TicketController } from './ticket.controller';
import {
  validateBody,
  validateQuery,
  validateParams,
} from '@/middleware/validate.middleware';
import {
  CreateTicketSchema,
  UpdateTicketByAgentSchema,
  AddCommunicationSchema,
  ListTicketsQuerySchema,
  TransferTicketSchema,
  UpdateTicketAssignmentSchema,
} from './dto';
import { protect, requireAuth } from '@/middleware/auth.middleware'; // protect populates req.user, requireAuth enforces it
import { authorize } from '@/middleware/role.middleware';
import { UserRole } from '@/modules/users/enums/user.enums';

const router = Router();
const ticketController = new TicketController();

// POST /tickets - Create a new ticket (Citizen, or Anonymous if auth is optional for this route)
// `protect` middleware makes req.user available if token is sent, but doesn't require it.
// Service layer will differentiate between logged-in user and anonymous based on req.user and DTO.
router.post(
  '/',
  // protect, // Apply protect globally in app.ts or here if needed for all ticket routes
  validateBody(CreateTicketSchema.shape.body),
  ticketController.createTicket
);

// GET /tickets - List tickets (access controlled in service based on role)
router.get(
  '/',
  // protect, // Assuming protect is global, otherwise add here
  validateQuery(ListTicketsQuerySchema.shape.query),
  ticketController.listTickets
);

// GET /tickets/:ticketId - Get a specific ticket (access controlled in service)
router.get(
  '/:ticketId',
  // protect,
  validateParams(UpdateTicketByAgentSchema.shape.params), // Re-use params schema
  ticketController.getTicketById
);

// POST /tickets/:ticketId/communications - Add a communication to a ticket
router.post(
  '/:ticketId/communications',
  // protect, // Needed to identify sender if not anonymous reply
  validateParams(AddCommunicationSchema.shape.params),
  validateBody(AddCommunicationSchema.shape.body),
  ticketController.addCommunication
);

// --- Routes requiring specific roles ---

// PATCH /tickets/:ticketId/status-update - Agent/Admin updates ticket status/priority
router.patch(
  '/:ticketId/status-update', // More specific endpoint name
  requireAuth, // Must be logged in
  authorize([UserRole.ADMIN, UserRole.AGENCY_STAFF]),
  (req: Request, res: Response, next: NextFunction) => { // Custom validation for combined params/body
    const result = UpdateTicketByAgentSchema.safeParse({ params: req.params, body: req.body });
    if (!result.success) return next(result.error);
    req.validatedParams = result.data.params;
    req.validatedBody = result.data.body;
    next();
  },
  ticketController.updateTicketByAgent
);

// PATCH /tickets/:ticketId/assign - Admin assigns/unassigns an agent
router.patch(
    '/:ticketId/assign',
    requireAuth,
    authorize([UserRole.ADMIN]), // Or more granular permissions later
    (req: Request, res: Response, next: NextFunction) => {
        const result = UpdateTicketAssignmentSchema.safeParse({ params: req.params, body: req.body });
        if (!result.success) return next(result.error);
        req.validatedParams = result.data.params;
        req.validatedBody = result.data.body;
        next();
    },
    ticketController.updateTicketAssignment
);


// POST /tickets/:ticketId/transfer - Agent/Admin transfers ticket to another agency
router.post(
    '/:ticketId/transfer',
    requireAuth,
    authorize([UserRole.ADMIN, UserRole.AGENCY_STAFF]),
    (req: Request, res: Response, next: NextFunction) => {
        const result = TransferTicketSchema.safeParse({ params: req.params, body: req.body });
        if (!result.success) return next(result.error);
        req.validatedParams = result.data.params;
        req.validatedBody = result.data.body;
        next();
    },
    ticketController.transferTicket
);


export default router;
