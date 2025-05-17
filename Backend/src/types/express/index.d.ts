// src/types/express/index.d.ts
import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';

export {}; // To make the file a module

export interface JwtPayload {
  userId: string;
  role: PrismaUserRole;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    export interface Request {
      user?: PrismaUser;
      validatedBody?: any;    // Or a more specific type if you have a base DTO type
      validatedQuery?: any;   // Or a more specific type
      validatedParams?: any;  // Or a more specific type
    }
  }
}





// import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';

// // To make the file a module and avoid global pollution.
// export {};

// // Define a more specific payload for your JWT if needed
// export interface JwtPayload {
//   userId: string;
//   role: PrismaUserRole; // Assuming UserRole enum from Prisma matches your app's UserRole
//   // Add other fields you might include in the JWT payload
// }

// declare global {
//   namespace Express {
//     export interface Request {
//       // Use PrismaUser directly if you fetch the full user object
//       // Or use a leaner UserPayload type if you only attach JWT decoded info
//       user?: PrismaUser; // Or your custom UserPayload type
//     }
//   }
// }
