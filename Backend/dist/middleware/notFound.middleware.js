"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const ApiError_1 = require("@/utils/ApiError");
const notFoundHandler = (req, res, next) => {
    const error = new ApiError_1.ApiError(404, `Not Found - ${req.originalUrl}`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
