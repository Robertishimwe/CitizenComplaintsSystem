"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const ApiError_1 = require("@/utils/ApiError");
const environment_1 = require("@/config/environment");
const logger_config_1 = require("@/config/logger.config");
const errorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next // NextFunction must be declared for Express to recognize it as an error handler
) => {
    let errorResponse = {
        statusCode: 500,
        message: 'Internal Server Error',
    };
    // Log the error internally
    logger_config_1.logger.error(err);
    if (err instanceof ApiError_1.ApiError) {
        errorResponse.statusCode = err.statusCode;
        errorResponse.message = err.message;
    }
    else if (err instanceof zod_1.ZodError) {
        errorResponse.statusCode = 400; // Bad Request
        errorResponse.message = 'Validation failed';
        errorResponse.errors = err.flatten().fieldErrors;
    }
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
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
    }
    else if (err.name === 'SyntaxError' && 'body' in err) { // JSON parsing error
        errorResponse.statusCode = 400;
        errorResponse.message = 'Malformed JSON in request body.';
    }
    else if (environment_1.env.NODE_ENV === 'development' && err.stack) {
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
exports.errorHandler = errorHandler;
