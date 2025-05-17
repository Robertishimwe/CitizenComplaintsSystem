// src/utils/catchAsync.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Wraps async route handlers to catch errors and pass them to the global error handler
const catchAsync = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default catchAsync;
