// src/config/logger.config.ts
import pino, { LoggerOptions, Logger } from 'pino'; // Import Logger type
import { env } from './environment';

const pinoOptions: LoggerOptions = {
  level: env.LOG_LEVEL,
};


if (env.NODE_ENV === 'development') {
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
export const logger: Logger = pino(pinoOptions);


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