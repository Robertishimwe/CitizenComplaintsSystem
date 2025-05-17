// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodSchema } from 'zod';
import { ApiError } from '@/utils/ApiError'; // Or just pass ZodError to global error handler

// This middleware factory validates different parts of the request against a Zod schema.
export const validate =
  (schema: ZodSchema<any>)=>
// export const validate =
//   (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Zod will parse and validate:
      // - req.body
      // - req.query
      // - req.params
      // depending on the schema structure.
      // If you want to validate them separately, create separate schemas and middleware calls.
      // For a combined approach, your schema should reflect the request structure.
      // Example: schema = z.object({ body: bodySchema, query: querySchema })

      // Common practice: validate body, query, and params separately.
      // Here, we assume the schema is for req.body, but it can be adapted.

      // For validating body:
      if (Object.keys(req.body).length > 0) {
        req.body = await schema.parseAsync(req.body);
      }
      // For validating query params:
      // if (Object.keys(req.query).length > 0) {
      //   req.query = await schema.parseAsync(req.query);
      // }
      // For validating path params:
      // if (Object.keys(req.params).length > 0) {
      //   req.params = await schema.parseAsync(req.params);
      // }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Pass the ZodError to the global error handler for consistent formatting
        return next(error);
      }
      // For other unexpected errors during validation
      return next(new ApiError(500, 'An unexpected error occurred during validation.'));
    }
  };

// Specific validators (more explicit, easier to use)
export const validateBody =
  (schema: ZodSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error); // ZodError or other
    }
  };

export const validateQuery =
  (schema: ZodSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };

export const validateParams =
  (schema: ZodSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
  