import { User as PrismaUser, UserRole } from '@prisma/client'; // Or your local UserRole enum

export interface LoginResponse {
  user: Omit<PrismaUser, 'password'>; // Send user details without password
  tokens: {
    accessToken: string;
    // refreshToken?: string; // Add if implementing refresh tokens
  };
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  // You can add more fields like email, phone if needed, but keep payload small
  // Consider security implications of what's in the JWT payload
  iat?: number; // Issued at (standard JWT claim)
  exp?: number; // Expiration time (standard JWT claim)
}
