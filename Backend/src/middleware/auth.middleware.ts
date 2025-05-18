import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '@/config/environment'; 
import { ApiError } from '@/utils/ApiError';
import prisma from '@/config/prisma';
import { JwtPayload } from '@/types/express';
import { ResourceStatus } from '@/modules/users/enums/user.enums';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {

    return next(); 
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
