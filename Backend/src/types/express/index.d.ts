import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';

// To make the file a module and avoid global pollution.
export {};

// Define a more specific payload for your JWT if needed
export interface JwtPayload {
  userId: string;
  role: PrismaUserRole; // Assuming UserRole enum from Prisma matches your app's UserRole
  // Add other fields you might include in the JWT payload
}

declare global {
  namespace Express {
    export interface Request {
      // Use PrismaUser directly if you fetch the full user object
      // Or use a leaner UserPayload type if you only attach JWT decoded info
      user?: PrismaUser; // Or your custom UserPayload type
    }
  }
}
