// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '@/utils/ApiError';
import { env } from '@/config/environment';
import logger from '@/config/logger.config'; // Assuming logger.config.ts exports logger

interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: any; // For validation errors
  stack?: string;
}

export const errorHandler = (
  err: Error | ApiError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction // NextFunction must be declared for Express to recognize it as an error handler
): void => {
  let errorResponse: ErrorResponse = {
    statusCode: 500,
    message: 'Internal Server Error',
  };

  // Log the error internally
  logger.error(err);

  if (err instanceof ApiError) {
    errorResponse.statusCode = err.statusCode;
    errorResponse.message = err.message;
  } else if (err instanceof ZodError) {
    errorResponse.statusCode = 400; // Bad Request
    errorResponse.message = 'Validation failed';
    errorResponse.errors = err.flatten().fieldErrors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    // https://www.prisma.io/docs/reference/api-reference/error-reference#prismaclientknownrequesterror
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        errorResponse.statusCode = 409; // Conflict
        errorResponse.message = `Unique constraint failed on the field(s): ${err.meta?.target}`;
        break;
      case 'P2025': // Record to update/delete does not exist
        errorResponse.statusCode = 404; // Not Found
        errorResponse.message = `Record not found: ${err.meta?.cause || 'The requested resource could not be found.'}`;
        break;
      // Add more Prisma error codes as needed
      default:
        errorResponse.statusCode = 500;
        errorResponse.message = 'A database error occurred.';
    }
  } else if (err.name === 'SyntaxError' && 'body' in err) { // JSON parsing error
      errorResponse.statusCode = 400;
      errorResponse.message = 'Malformed JSON in request body.';
  } else if (env.NODE_ENV === 'development' && err.stack) {
    // Include stack trace in development for easier debugging
    errorResponse.stack = err.stack;
  }

  // Ensure message is always a string
  if (typeof errorResponse.message !== 'string') {
    errorResponse.message = 'An unexpected error occurred.';
  }

  res.status(errorResponse.statusCode).json({
    status: 'error',
    statusCode: errorResponse.statusCode,
    message: errorResponse.message,
    ...(errorResponse.errors && { errors: errorResponse.errors }),
    ...(errorResponse.stack && { stack: errorResponse.stack }), // Only include stack in dev
  });
};
