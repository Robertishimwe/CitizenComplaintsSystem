import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/environment'; // Use path alias or relative path
import { ApiError } from '@/utils/ApiError';
import prisma from '@/config/prisma';
import { JwtPayload } from '@/types/express'; // Import your JwtPayload
import { ResourceStatus } from '@/modules/users/enums/user.enums';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Allow access if no token is present, for public routes
  // Specific routes needing auth should call protect first.
  // If you want to enforce auth on all routes by default and only allow some public,
  // then this logic should throw an error if no token.
  // For this system, some routes (like view anonymous ticket) are public.

  if (!token) {
    // If a route explicitly requires authentication and no token is found,
    // it should be handled by the route or a subsequent middleware.
    // Or, you can throw an error here if the expectation is that `protect` always means "must be authenticated".
    // For now, let's assume if a token exists, we validate it. If not, `req.user` remains undefined.
    // Routes that NEED a user will check for `req.user`.
    return next(); // Proceed, req.user will be undefined
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId, status: ResourceStatus.ACTIVE },
    });

    if (!currentUser) {
      return next(new ApiError(401, 'User belonging to this token no longer exists or is inactive.'));
    }

    // Attach user to the request object
    req.user = currentUser;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, 'Token expired, please log in again.'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, 'Invalid token, please log in again.'));
    }
    return next(new ApiError(401, 'Not authorized, token failed.'));
  }
};

// Middleware to ensure a user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new ApiError(401, 'Authentication required. Please log in.'));
    }
    next();
};
