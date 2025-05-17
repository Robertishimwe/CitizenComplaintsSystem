#!/bin/bash

echo "Creating project structure for Citizen Engagement System API..."

# Create root level files
echo "Creating root files..."
touch .env .env.example .gitignore README.md package.json tsconfig.json
touch .dockerignore Dockerfile docker-compose.yml # Included as per example, comment out if not immediately needed

# Create root level directories
echo "Creating root directories..."
mkdir -p prisma src tests

# --- Prisma ---
echo "Creating prisma files..."
touch prisma/schema.prisma

# --- Src Directory ---
echo "Creating src core files..."
touch src/app.ts src/server.ts src/index.ts

echo "Creating src subdirectories..."
mkdir -p src/config \
         src/modules \
         src/middleware \
         src/utils \
         src/types/express \
         src/interfaces \
         src/services

# --- Src/Config ---
echo "Creating config files..."
touch src/config/index.ts \
      src/config/environment.ts \
      src/config/prisma.ts \
      src/config/bullmq.ts \
      src/config/pindo.ts \
      src/config/gemini.ts \
      src/config/logger.config.ts

# --- Src/Modules ---
echo "Creating modules structure..."

# Auth Module
mkdir -p src/modules/auth/dto src/modules/auth/interfaces
touch src/modules/auth/auth.controller.ts \
      src/modules/auth/auth.service.ts \
      src/modules/auth/auth.routes.ts \
      src/modules/auth/interfaces/auth.interfaces.ts \
      src/modules/auth/dto/index.ts \
      src/modules/auth/dto/login.dto.ts \
      src/modules/auth/dto/register-citizen.dto.ts \
      src/modules/auth/dto/create-staff.dto.ts

# Users Module
mkdir -p src/modules/users/dto src/modules/users/interfaces src/modules/users/enums
touch src/modules/users/user.controller.ts \
      src/modules/users/user.service.ts \
      src/modules/users/user.repository.ts \
      src/modules/users/user.routes.ts \
      src/modules/users/interfaces/user.interfaces.ts \
      src/modules/users/enums/user.enums.ts \
      src/modules/users/dto/index.ts \
      src/modules/users/dto/create-user.dto.ts \
      src/modules/users/dto/update-user.dto.ts

# Agencies Module
mkdir -p src/modules/agencies/dto src/modules/agencies/interfaces
touch src/modules/agencies/agency.controller.ts \
      src/modules/agencies/agency.service.ts \
      src/modules/agencies/agency.repository.ts \
      src/modules/agencies/agency.routes.ts \
      src/modules/agencies/interfaces/agency.interfaces.ts \
      src/modules/agencies/dto/index.ts \
      src/modules/agencies/dto/create-agency.dto.ts \
      src/modules/agencies/dto/update-agency.dto.ts

# Categories Module
mkdir -p src/modules/categories/dto src/modules/categories/interfaces
touch src/modules/categories/category.controller.ts \
      src/modules/categories/category.service.ts \
      src/modules/categories/category.repository.ts \
      src/modules/categories/category.routes.ts \
      src/modules/categories/interfaces/category.interfaces.ts \
      src/modules/categories/dto/index.ts \
      src/modules/categories/dto/create-category.dto.ts \
      src/modules/categories/dto/update-category.dto.ts

# RoutingRules Module
mkdir -p src/modules/routingRules/dto src/modules/routingRules/interfaces
touch src/modules/routingRules/routing-rule.controller.ts \
      src/modules/routingRules/routing-rule.service.ts \
      src/modules/routingRules/routing-rule.repository.ts \
      src/modules/routingRules/routing-rule.routes.ts \
      src/modules/routingRules/interfaces/routing-rule.interfaces.ts \
      src/modules/routingRules/dto/index.ts \
      src/modules/routingRules/dto/create-routing-rule.dto.ts \
      src/modules/routingRules/dto/update-routing-rule.dto.ts

# Tickets Module
mkdir -p src/modules/tickets/dto src/modules/tickets/interfaces src/modules/tickets/enums src/modules/tickets/services
touch src/modules/tickets/ticket.controller.ts \
      src/modules/tickets/ticket.service.ts \
      src/modules/tickets/ticket.repository.ts \
      src/modules/tickets/ticket.routes.ts \
      src/modules/tickets/interfaces/ticket.interfaces.ts \
      src/modules/tickets/enums/ticket.enums.ts \
      src/modules/tickets/services/ticket.ai.service.ts \
      src/modules/tickets/dto/index.ts \
      src/modules/tickets/dto/create-ticket.dto.ts \
      src/modules/tickets/dto/update-ticket.dto.ts \
      src/modules/tickets/dto/add-communication.dto.ts \
      src/modules/tickets/dto/transfer-ticket.dto.ts

# Notifications Module
mkdir -p src/modules/notifications/interfaces
touch src/modules/notifications/notification.service.ts \
      src/modules/notifications/notification.worker.ts \
      src/modules/notifications/notification.queues.ts \
      src/modules/notifications/interfaces/notification.interfaces.ts

# --- Src/Middleware ---
echo "Creating middleware files..."
touch src/middleware/auth.middleware.ts \
      src/middleware/role.middleware.ts \
      src/middleware/error.middleware.ts \
      src/middleware/validate.middleware.ts \
      src/middleware/notFound.middleware.ts

# --- Src/Utils ---
echo "Creating util files..."
touch src/utils/ApiError.ts \
      src/utils/catchAsync.ts \
      src/utils/logger.ts \
      src/utils/pick.ts \
      src/utils/password.utils.ts \
      src/utils/phoneNumber.utils.ts

# --- Src/Types ---
echo "Creating type definition files..."
# Ensure express directory exists if not already by src/types/express path
mkdir -p src/types/express 
touch src/types/express/index.d.ts \
      src/types/common.types.ts

# --- Src/Interfaces (global) ---
echo "Creating global interfaces placeholder..."
touch src/interfaces/.gitkeep

# --- Src/Services (shared external services) ---
echo "Creating shared services placeholder..."
touch src/services/.gitkeep

# --- Tests ---
echo "Creating tests structure..."
mkdir -p tests/integration tests/unit tests/e2e
touch tests/jest.config.js \
      tests/setup.ts \
      tests/integration/.gitkeep \
      tests/unit/.gitkeep \
      tests/e2e/.gitkeep
# Example test files
touch tests/integration/auth.test.ts \
      tests/integration/tickets.test.ts \
      tests/unit/ticket.service.test.ts \
      tests/unit/user.service.test.ts


echo ""
echo "Project structure for Citizen Engagement System API created successfully!"
echo "----------------------------------------------------------------------"
echo "Next steps:"
echo "1. Initialize your project: 'npm init -y' (if you haven't already or want to regenerate package.json)."
echo "2. Install dependencies: 'npm install express dotenv prisma @prisma/client bullmq ioredis zod class-validator bcryptjs jsonwebtoken pino pino-pretty' (and dev dependencies like 'typescript ts-node nodemon @types/... jest supertest')."
echo "3. Configure '.env' based on '.env.example' with your specific credentials and settings."
echo "4. Set up Prisma: 'npx prisma init' (if you haven't already, this creates prisma/schema.prisma and .env if they don't exist. We've created schema.prisma already)."
echo "5. Define your models in 'prisma/schema.prisma'."
echo "6. Run your first migration: 'npx prisma migrate dev --name init'."
echo "7. Update 'tsconfig.json' (e.g., set 'outDir', 'rootDir', 'esModuleInterop', 'experimentalDecorators', 'emitDecoratorMetadata' if using class-validator with decorators)."
echo "8. Start developing the modules, beginning with core functionalities like authentication and user management."
echo "----------------------------------------------------------------------"

exit 0