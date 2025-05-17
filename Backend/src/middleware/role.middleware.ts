// src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client'; // Use Prisma's generated UserRole
import { ApiError } from '@/utils/ApiError';
import { requireAuth } from './auth.middleware'; // Ensure user is authenticated first

// This middleware factory checks if the authenticated user has one of the allowed roles.
// It should be used *after* the `protect` or `requireAuth` middleware.
export const authorize = (allowedRoles: UserRole[]) => {
  return [ // Return an array of middleware
    requireAuth, // First, ensure the user is authenticated
    (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.user.role) {
        // This case should ideally be caught by requireAuth, but as a safeguard:
        return next(new ApiError(401, 'Authentication required to check roles.'));
      }

      const hasRequiredRole = allowedRoles.includes(req.user.role);

      if (!hasRequiredRole) {
        return next(
          new ApiError(
            403,
            `Forbidden: Your role (${req.user.role}) is not authorized to access this resource.`
          )
        );
      }
      next();
    }
  ];
};

// Example specific role checks (optional conveniences)
export const isAdmin = authorize([UserRole.ADMIN]);
export const isAgencyStaff = authorize([UserRole.AGENCY_STAFF]);
export const isCitizen = authorize([UserRole.CITIZEN]);
export const isAdminOrAgencyStaff = authorize([UserRole.ADMIN, UserRole.AGENCY_STAFF]);
