"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/agencies/agency.routes.ts
const express_1 = require("express");
const agency_controller_1 = require("./agency.controller");
const validate_middleware_1 = require("@/middleware/validate.middleware");
const dto_1 = require("./dto");
const role_middleware_1 = require("@/middleware/role.middleware");
const user_enums_1 = require("@/modules/users/enums/user.enums"); // Or your shared UserRole
const router = (0, express_1.Router)();
const agencyController = new agency_controller_1.AgencyController();
router.get('/', (0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN, user_enums_1.UserRole.AGENCY_STAFF]), (0, validate_middleware_1.validateQuery)(dto_1.ListAgenciesQuerySchema.shape.query), agencyController.listAgencies);
// All agency routes are admin-only
router.use((0, role_middleware_1.authorize)([user_enums_1.UserRole.ADMIN]));
// POST /agencies - Create a new agency
router.post('/', (0, validate_middleware_1.validateBody)(dto_1.CreateAgencySchema.shape.body), agencyController.createAgency);
// GET /agencies - List all agencies
// router.get(
//   '/',
//   validateQuery(ListAgenciesQuerySchema.shape.query),
//   agencyController.listAgencies
// );
// GET /agencies/:agencyId - Get a specific agency
router.get('/:agencyId', (0, validate_middleware_1.validateParams)(dto_1.UpdateAgencySchema.shape.params), agencyController.getAgencyById);
// PATCH /agencies/:agencyId - Update an agency
router.patch('/:agencyId', (req, res, next) => {
    const result = dto_1.UpdateAgencySchema.safeParse({ params: req.params, body: req.body });
    if (!result.success) {
        return next(result.error);
    }
    req.params = result.data.params;
    req.body = result.data.body;
    next();
}, agencyController.updateAgency);
// DELETE /agencies/:agencyId - Deactivate an agency
router.delete('/:agencyId', (0, validate_middleware_1.validateParams)(dto_1.UpdateAgencySchema.shape.params), agencyController.deleteAgency);
exports.default = router;
