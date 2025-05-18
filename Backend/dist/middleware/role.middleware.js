"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminOrAgencyStaff = exports.isCitizen = exports.isAgencyStaff = exports.isAdmin = exports.authorize = void 0;
const client_1 = require("@prisma/client"); // Use Prisma's generated UserRole
const ApiError_1 = require("@/utils/ApiError");
const auth_middleware_1 = require("./auth.middleware"); // Ensure user is authenticated first
// This middleware factory checks if the authenticated user has one of the allowed roles.
// It should be used *after* the `protect` or `requireAuth` middleware.
const authorize = (allowedRoles) => {
    return [
        auth_middleware_1.requireAuth, // First, ensure the user is authenticated
        (req, res, next) => {
            if (!req.user || !req.user.role) {
                // This case should ideally be caught by requireAuth, but as a safeguard:
                return next(new ApiError_1.ApiError(401, 'Authentication required to check roles.'));
            }
            const hasRequiredRole = allowedRoles.includes(req.user.role);
            if (!hasRequiredRole) {
                return next(new ApiError_1.ApiError(403, `Forbidden: Your role (${req.user.role}) is not authorized to access this resource.`));
            }
            next();
        }
    ];
};
exports.authorize = authorize;
// Example specific role checks (optional conveniences)
exports.isAdmin = (0, exports.authorize)([client_1.UserRole.ADMIN]);
exports.isAgencyStaff = (0, exports.authorize)([client_1.UserRole.AGENCY_STAFF]);
exports.isCitizen = (0, exports.authorize)([client_1.UserRole.CITIZEN]);
exports.isAdminOrAgencyStaff = (0, exports.authorize)([client_1.UserRole.ADMIN, client_1.UserRole.AGENCY_STAFF]);
