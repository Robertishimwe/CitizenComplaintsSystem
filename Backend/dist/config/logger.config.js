"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// src/config/logger.config.ts
const pino_1 = __importDefault(require("pino")); // Import Logger type
const environment_1 = require("./environment");
const pinoOptions = {
    level: environment_1.env.LOG_LEVEL,
};
if (environment_1.env.NODE_ENV === 'development') {
    pinoOptions.transport = {
        target: 'pino-pretty', // <--- Pino tries to load this module
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    };
}
// Ensure 'logger' is exported as a named constant
exports.logger = (0, pino_1.default)(pinoOptions);
// import pino, { LoggerOptions } from 'pino';
// import { env } from './environment';
// const pinoOptions: LoggerOptions = {
//   level: env.LOG_LEVEL,
// };
// if (env.NODE_ENV === 'development') {
//   pinoOptions.transport = {
//     target: 'pino-pretty',
//     options: {
//       colorize: true,
//       translateTime: 'SYS:standard', // More readable timestamp
//       ignore: 'pid,hostname',       // Ignore these fields in pretty print
//     },
//   };
// }
// const logger = pino(pinoOptions);
// export default logger;
// // You can also export specific logger functions if needed
// // export const logInfo = (msg: string, obj?: any) => logger.info(obj, msg);
// // export const logError = (err: Error, msg?: string) => logger.error(err, msg);
