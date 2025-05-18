"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
// ApiError import might not be needed here if ZodError is passed directly to global error handler
const validateBody = (schema) => async (req, res, next) => {
    try {
        req.validatedBody = await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        // Pass ZodError (or any other error) to the global error handler
        next(error);
    }
};
exports.validateBody = validateBody;
const validateQuery = (schema) => async (req, res, next) => {
    try {
        req.validatedQuery = await schema.parseAsync(req.query);
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => async (req, res, next) => {
    try {
        req.validatedParams = await schema.parseAsync(req.params);
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateParams = validateParams;
// If you have a combined validator for PATCH routes in user.routes.ts,
// that custom middleware will also need to be adjusted to not reassign req.params and req.body directly.
// For now, let's focus on these individual validators.
// // src/middleware/validate.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import { AnyZodObject, ZodError, ZodSchema } from 'zod';
// import { ApiError } from '@/utils/ApiError'; // Or just pass ZodError to global error handler
// // This middleware factory validates different parts of the request against a Zod schema.
// export const validate =
//   (schema: ZodSchema<any>)=>
// // export const validate =
// //   (schema: AnyZodObject) =>
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       // Zod will parse and validate:
//       // - req.body
//       // - req.query
//       // - req.params
//       // depending on the schema structure.
//       // If you want to validate them separately, create separate schemas and middleware calls.
//       // For a combined approach, your schema should reflect the request structure.
//       // Example: schema = z.object({ body: bodySchema, query: querySchema })
//       // Common practice: validate body, query, and params separately.
//       // Here, we assume the schema is for req.body, but it can be adapted.
//       // For validating body:
//       if (Object.keys(req.body).length > 0) {
//         req.body = await schema.parseAsync(req.body);
//       }
//       // For validating query params:
//       // if (Object.keys(req.query).length > 0) {
//       //   req.query = await schema.parseAsync(req.query);
//       // }
//       // For validating path params:
//       // if (Object.keys(req.params).length > 0) {
//       //   req.params = await schema.parseAsync(req.params);
//       // }
//       next();
//     } catch (error) {
//       if (error instanceof ZodError) {
//         // Pass the ZodError to the global error handler for consistent formatting
//         return next(error);
//       }
//       // For other unexpected errors during validation
//       return next(new ApiError(500, 'An unexpected error occurred during validation.'));
//     }
//   };
// // Specific validators (more explicit, easier to use)
// export const validateBody =
//   (schema: ZodSchema<any>) =>
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       req.body = await schema.parseAsync(req.body);
//       next();
//     } catch (error) {
//       next(error); // ZodError or other
//     }
//   };
// export const validateQuery =
//   (schema: ZodSchema<any>) =>
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       req.query = await schema.parseAsync(req.query);
//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// export const validateParams =
//   (schema: ZodSchema<any>) =>
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       req.params = await schema.parseAsync(req.params);
//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
