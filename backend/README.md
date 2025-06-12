# QR Check-in Backend

This is the backend service for the QR Check-in system, built with NestJS, GraphQL, Prisma, and PostgreSQL.

## Features

- User authentication with JWT
- Role-based access control
- Club and event management
- Subscription and subscription package management
- QR code generation for check-ins
- Check-in tracking and reporting
- Redis caching

## Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL
- Redis (optional for development)
- Docker and Docker Compose (for containerized deployment)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following content (adjust as needed):

```
# Database Configuration
DATABASE_URL="postgresql://qr_user:qr_password@localhost:5433/qr_checkin_db"

# JWT Configuration
JWT_SECRET="your-development-jwt-secret-key-change-this-in-production"
JWT_EXPIRATION="1d"

# Redis Configuration (optional for development)
REDIS_URL="redis://localhost:6380"

# Application Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"

# Debug (optional)
DEBUG=prisma:*,app:*
```

### 3. Start Database Services

Start PostgreSQL and Redis using Docker Compose:

```bash
cd ..
docker-compose up -d postgres redis
```

### 4. Database Setup

Generate the Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed the Database (Optional)

Populate the database with initial data:

```bash
npm run prisma:seed
```

### 6. Start the Server

For development with auto-reload:

```bash
npm run start:dev
```

For production:

```bash
npm run build
npm run start:prod
```

## API Documentation

Once the server is running, you can access the GraphQL playground at:
http://localhost:4000/graphql

## Default Users

After running the seed script, the following users are available:

- Admin: admin@qrcheckin.com / admin123
- Staff: staff@qrcheckin.com / staff123
- User: user@qrcheckin.com / user123

## Project Structure

- `/src` - Main source code
  - `/auth` - Authentication and authorization
  - `/users` - User management
  - `/clubs` - Club management
  - `/events` - Event management
  - `/subscription` - Subscription and package management
  - `/checkin` - Check-in functionality
  - `/common` - Shared resources (DTOs, enums, mappers)
  - `/config` - Application configuration
  - `/prisma` - Prisma service
  - `/redis` - Redis service
- `/prisma` - Prisma schema and migrations
- `/test` - Unit and integration tests

## Docker Deployment

To build and run the application using Docker:

```bash
cd ..
docker-compose up -d
```

## License

MIT
