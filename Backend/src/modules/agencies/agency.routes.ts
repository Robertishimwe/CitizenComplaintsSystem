// src/modules/agencies/agency.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { AgencyController } from './agency.controller';
import { validateBody, validateQuery, validateParams } from '@/middleware/validate.middleware';
import { CreateAgencySchema, UpdateAgencySchema, ListAgenciesQuerySchema } from './dto';
import { authorize } from '@/middleware/role.middleware';
import { UserRole } from '@/modules/users/enums/user.enums'; // Or your shared UserRole

const router = Router();
const agencyController = new AgencyController();

router.get(
  '/',
  authorize([UserRole.ADMIN, UserRole.AGENCY_STAFF]),
  validateQuery(ListAgenciesQuerySchema.shape.query),
  agencyController.listAgencies
);
// All agency routes are admin-only
router.use(authorize([UserRole.ADMIN]));

// POST /agencies - Create a new agency
router.post(
  '/',
  validateBody(CreateAgencySchema.shape.body),
  agencyController.createAgency
);

// GET /agencies - List all agencies
// router.get(
//   '/',
//   validateQuery(ListAgenciesQuerySchema.shape.query),
//   agencyController.listAgencies
// );

// GET /agencies/:agencyId - Get a specific agency
router.get(
  '/:agencyId',
  validateParams(UpdateAgencySchema.shape.params),
  agencyController.getAgencyById
);

// PATCH /agencies/:agencyId - Update an agency
router.patch(
  '/:agencyId',
  (req: Request, res: Response, next: NextFunction) => {
    const result = UpdateAgencySchema.safeParse({ params: req.params, body: req.body });
    if (!result.success) {
      return next(result.error);
    }
    req.params = result.data.params as any;
    req.body = result.data.body;
    next();
  },
  agencyController.updateAgency
);

// DELETE /agencies/:agencyId - Deactivate an agency
router.delete(
  '/:agencyId',
  validateParams(UpdateAgencySchema.shape.params),
  agencyController.deleteAgency
);

export default router;
