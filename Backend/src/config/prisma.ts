import { PrismaClient } from '@prisma/client';
import { env } from './environment'; // Assuming environment.ts exports `env`

// Initialize Prisma Client
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

/**
 * This setup ensures that in development, you don't create a new PrismaClient
 * instance every time your code reloads (due to HMR or similar).
 * In production, it will always create a new instance.
 */