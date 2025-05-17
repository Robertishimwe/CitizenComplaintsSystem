// src/db/seed.ts
import prisma from '@/config/prisma';
import { env } from '@/config/environment';
import { logger } from '@/config/logger.config';
import { UserRole, ResourceStatus } from '@prisma/client'; // Or from your enums if defined locally
import { hashPassword } from '@/utils/password.utils';

export const seedAdminUser = async (): Promise<void> => {
  // Optional: Only run seeder in development environment
  if (env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test') {
    logger.info('🌱 Admin seeder skipped in non-development environment.');
    return;
  }

  try {
    const adminEmail = env.DEFAULT_ADMIN_EMAIL;
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      logger.info(`🌱 Admin user with email "${adminEmail}" already exists. Seeding skipped.`);
      return;
    }

    const hashedPassword = await hashPassword(env.DEFAULT_ADMIN_PASSWORD);

    const adminUser = await prisma.user.create({
      data: {
        name: env.DEFAULT_ADMIN_NAME,
        email: adminEmail,
        phone: env.DEFAULT_ADMIN_PHONE, // Ensure this phone is unique or handle potential conflicts
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: ResourceStatus.ACTIVE,
        // No agencyId for ADMIN
      },
    });

    logger.info(`🌱 Admin user "${adminUser.name}" with email "${adminUser.email}" created successfully.`);

  } catch (error) {
    logger.error('❌ Error during admin user seeding:', error);
    // Depending on severity, you might want to throw the error to halt server startup
    // or just log it and continue. For a seeder, logging is often sufficient.
  }
};
