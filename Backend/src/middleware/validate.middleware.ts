// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
// ApiError import might not be needed here if ZodError is passed directly to global error handler

export const validateBody =
  (schema: ZodSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.validatedBody = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      // Pass ZodError (or any other error) to the global error handler
      next(error);
    }
  };

export const validateQuery =
  (schema: ZodSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.validatedQuery = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      next(error);
    }
  };

export const validateParams =
  (schema: ZodSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.validatedParams = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
