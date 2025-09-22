# Serabutan Backend API Documentation

## Overview
The **Serabutan Backend API** is a RESTful API built with **TypeScript**, **Express**, **Prisma**, and **Zod** for a service marketplace application. It supports user authentication via **Google OAuth**, **JWT-based authentication**, and **role-based access control** (CLIENT, WORKER, ADMIN). The API allows clients to browse workers, view service details, and place orders via WhatsApp, while workers can manage their profiles and services. Additional features include location-based worker search using the Haversine formula and Swagger documentation for API exploration.

This documentation provides setup instructions, endpoint details, database schema, and usage guidelines to ensure developers can effectively use and extend the API.

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Database Schema](#database-schema)
6. [Authentication](#authentication)
7. [API Endpoints](#api-endpoints)
   - [Auth Endpoints](#auth-endpoints)
   - [Worker Endpoints](#worker-endpoints)
   - [Service Endpoints](#service-endpoints)
   - [Order Endpoints](#order-endpoints)
   - [Location Endpoints](#location-endpoints)
8. [Error Handling](#error-handling)
9. [Swagger Documentation](#swagger-documentation)
10. [Additional Notes](#additional-notes)

---

## Features
- **User Authentication**: Login/register using Google OAuth with default role `CLIENT`.
- **Role-Based Access Control**: Supports `CLIENT`, `WORKER`, and `ADMIN` roles.
- **Worker Profile Management**: Workers can upgrade from `CLIENT` to `WORKER`, update their bio, price, phone, and skills, and manage services.
- **Service Management**: Workers can create, update, and delete services with title, description, and price.
- **Order Placement**: Clients can place orders, which redirect to WhatsApp for communication (no payment gateway).
- **Location-Based Search**: Find nearby workers using the Haversine formula based on latitude/longitude.
- **API Documentation**: Swagger UI for interactive endpoint exploration.

---

## Tech Stack
- **Node.js & Express**: Backend framework for building RESTful APIs.
- **TypeScript**: Adds static typing for better code reliability.
- **Prisma**: ORM for database management (PostgreSQL or SQLite).
- **Zod**: Schema validation for request bodies.
- **JWT**: JSON Web Tokens for authentication.
- **Passport**: Google OAuth integration for login/register.
- **Swagger**: API documentation with `swagger-ui-express` and `swagger-autogen`.
- **dotenv**: Environment variable management.

---

## Project Structure
```
serabutan-backend/
├── prisma/
│   ├── schema.prisma              # Prisma database schema
│   └── seed.ts                   # Optional seeding script
├── src/
│   ├── controllers/               # Endpoint logic
│   │   ├── auth.controller.ts
│   │   ├── worker.controller.ts
│   │   ├── service.controller.ts
│   │   ├── order.controller.ts
│   │   └── location.controller.ts
│   ├── routes/                   # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── worker.routes.ts
│   │   ├── service.routes.ts
│   │   ├── order.routes.ts
│   │   └── location.routes.ts
│   ├── dtos/                     # Zod validation schemas
│   │   ├── user.dto.ts
│   │   ├── worker.dto.ts
│   │   ├── service.dto.ts
│   │   ├── order.dto.ts
│   │   └── location.dto.ts
│   ├── middlewares/              # Middleware for authentication and errors
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/                    # Helper utilities
│   │   ├── prisma.ts            # Prisma client instance
│   │   ├── jwt.ts               # JWT generation/verification
│   │   └── response.ts          # Response formatter (optional)
│   ├── services/                 # Business logic (optional)
│   │   └── worker.service.ts
│   ├── docs/                     # Swagger documentation
│   │   └── swagger.ts
│   ├── app.ts                    # Express app setup
│   └── index.ts                  # Server entry point
├── swagger.json                  # Generated Swagger documentation
├── .env                          # Environment variables
├── package.json
└── tsconfig.json
```

---

## Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher)
- **PostgreSQL** (or SQLite for development)
- **npm** or **yarn**
- Google OAuth credentials (Client ID and Secret)

### Installation
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd serabutan-backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory with the following:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/serabutan_db"
   JWT_SECRET="your_jwt_secret"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
   PORT=3000
   ```

4. **Initialize Prisma**:
   - Run Prisma migrations to set up the database:
     ```bash
     npx prisma generate
     npx prisma db push
     ```
   - (Optional) Seed the database:
     ```bash
     npx prisma db seed
     ```

5. **Generate Swagger Documentation**:
   ```bash
   node src/docs/swagger.ts
   ```

6. **Start the Server**:
   ```bash
   npm run start
   ```
   The server will run on `http://localhost:3000`. Access the Swagger UI at `http://localhost:3000/api-docs`.

### Build for Production
```bash
npm run build
node dist/index.js
```

---

## Database Schema
The database is managed by **Prisma** with the following schema (defined in `prisma/schema.prisma`):

### Models
- **User**:
  - `id: String` (UUID, primary key)
  - `name: String`
  - `email: String` (unique)
  - `password: String?` (optional, not used for Google OAuth)
  - `role: Role` (enum: `CLIENT`, `WORKER`, `ADMIN`, default: `CLIENT`)
  - `phone: String?`
  - `worker: Worker?` (one-to-one relation)
  - `orders: Order[]` (as client)
  - `location: Location?` (one-to-one relation)
  - `createdAt: DateTime`
  - `updatedAt: DateTime`

- **Worker**:
  - `id: String` (UUID, primary key)
  - `userId: String` (unique, foreign key to `User`)
  - `bio: String?`
  - `price: Float?`
  - `skills: WorkerSkill[]` (many-to-many relation via `WorkerSkill`)
  - `services: Service[]`
  - `orders: Order[]` (as worker)
  - `createdAt: DateTime`
  - `updatedAt: DateTime`

- **Skill**:
  - `id: String` (UUID, primary key)
  - `name: String` (unique)
  - `workerSkills: WorkerSkill[]`

- **WorkerSkill** (junction table for many-to-many relation):
  - `workerId: String`
  - `skillId: String`
  - Composite primary key: `[workerId, skillId]`

- **Service**:
  - `id: String` (UUID, primary key)
  - `workerId: String` (foreign key to `Worker`)
  - `title: String`
  - `description: String?`
  - `price: Float`
  - `createdAt: DateTime`
  - `updatedAt: DateTime`

- **Location**:
  - `id: String` (UUID, primary key)
  - `userId: String` (unique, foreign key to `User`)
  - `latitude: Float`
  - `longitude: Float`
  - `address: String?`
  - `createdAt: DateTime`
  - `updatedAt: DateTime`

- **Order**:
  - `id: String` (UUID, primary key)
  - `clientId: String` (foreign key to `User`)
  - `workerId: String` (foreign key to `Worker`)
  - `serviceDate: DateTime`
  - `status: OrderStatus` (enum: `PENDING`, `CONFIRMED`, `DONE`, `CANCELED`)
  - `note: String?`
  - `createdAt: DateTime`
  - `updatedAt: DateTime`

### Enums
- **Role**: `CLIENT`, `WORKER`, `ADMIN`
- **OrderStatus**: `PENDING`, `CONFIRMED`, `DONE`, `CANCELED`

---

## Authentication
- **Google OAuth**: Users can log in or register via Google OAuth, receiving a JWT token upon successful authentication. New users are assigned the `CLIENT` role by default.
- **JWT**: All protected endpoints require a JWT token in the `Authorization` header as `Bearer <token>`.
- **Role-Based Access**:
  - `CLIENT`: Can view workers, services, and place orders.
  - `WORKER`: Can manage their profile and services, upgrade from `CLIENT`.
  - `ADMIN`: Not fully implemented but reserved for future use.
- **Middleware**: The `authMiddleware` checks for valid JWT and enforces role-based access where specified.

---

## API Endpoints
All endpoints are prefixed with `http://localhost:3000`. Use the Swagger UI at `/api-docs` for interactive testing.

### Auth Endpoints
| Method | Endpoint                | Description                          | Role Required | Request Body                     | Response                     |
|--------|-------------------------|--------------------------------------|---------------|----------------------------------|------------------------------|
| GET    | `/auth/google`          | Initiates Google OAuth login         | None          | None                             | Redirects to Google OAuth    |
| GET    | `/auth/google/callback` | Handles Google OAuth callback        | None          | None                             | `{ token: string }`          |
| POST   | `/auth/upgrade-worker`  | Upgrades a `CLIENT` to `WORKER` role | `CLIENT`      | None                             | `{ message: string, worker }` |

### Worker Endpoints
| Method | Endpoint                   | Description                          | Role Required | Request Body (Zod Schema)        | Response                     |
|--------|----------------------------|--------------------------------------|---------------|----------------------------------|------------------------------|
| GET    | `/worker/profile`          | Get worker profile                   | `WORKER`      | None                             | Worker profile data          |
| PUT    | `/worker/profile`          | Update worker profile                | `WORKER`      | `{ bio?, price?, phone?, skills? }` | Updated worker data         |
| GET    | `/worker/:id`              | Get worker by ID                    | None          | None                             | Worker data                 |
| GET    | `/worker/nearby`           | Get nearby workers (Haversine)      | None          | Query: `{ lat, lon, maxDistance? }` | List of nearby workers     |

### Service Endpoints
| Method | Endpoint                     | Description                          | Role Required | Request Body (Zod Schema)        | Response                     |
|--------|------------------------------|--------------------------------------|---------------|----------------------------------|------------------------------|
| POST   | `/service`                   | Create a new service                 | `WORKER`      | `{ title, description?, price }` | Created service             |
| PUT    | `/service/:id`               | Update a service                    | `WORKER`      | `{ title, description?, price }` | Updated service             |
| DELETE | `/service/:id`               | Delete a service                    | `WORKER`      | None                             | `{ message: string }`       |
| GET    | `/service/worker/:workerId`  | Get services by worker ID           | None          | None                             | List of services            |

### Order Endpoints
| Method | Endpoint         | Description                          | Role Required | Request Body (Zod Schema)        | Response                     |
|--------|------------------|--------------------------------------|---------------|----------------------------------|------------------------------|
| POST   | `/order`         | Create an order (redirects to WhatsApp) | `CLIENT`      | `{ workerId, serviceDate, note? }` | `{ order, whatsappUrl }`  |

### Location Endpoints
| Method | Endpoint             | Description                          | Role Required | Request Body (Zod Schema)        | Response                     |
|--------|----------------------|--------------------------------------|---------------|----------------------------------|------------------------------|
| POST   | `/location/upsert`   | Create or update user location       | Any           | `{ latitude, longitude, address? }` | Updated location           |
| GET    | `/location/nearby`   | Get nearby locations (Haversine)     | None          | Query: `{ lat, lon, maxDistance? }` | List of nearby locations  |

---

## Error Handling
- **400 Bad Request**: Invalid request body (Zod validation errors).
- **401 Unauthorized**: Missing or invalid JWT token.
- **403 Forbidden**: User lacks required role for the endpoint.
- **404 Not Found**: Resource (e.g., worker, service) not found.
- **500 Internal Server Error**: Unexpected server errors (logged to console).

The `error.middleware.ts` (optional) can be extended for custom error handling.

---

## Swagger Documentation
- **Generate Swagger JSON**:
  ```bash
  node src/docs/swagger.ts
  ```
  This generates `swagger.json` in the root directory.
- **Access Swagger UI**: Visit `http://localhost:3000/api-docs` to explore and test endpoints interactively.
- **Customization**: Add JSDoc comments with `@swagger` tags in controllers for more detailed documentation. Example:
  ```typescript
  /**
   * @swagger
   * /worker/profile:
   *   get:
   *     summary: Get worker profile
   *     tags: [Worker]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Worker profile
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Worker not found
   */
  ```

---

## Additional Notes
- **Haversine Formula**: Used in `/worker/nearby` and `/location/nearby` to calculate distances based on latitude and longitude. The default radius is 6371 km (Earth’s radius).
- **WhatsApp Integration**: Orders generate a WhatsApp URL with the worker’s phone number and order details for direct communication.
- **Scalability**: The codebase is modular and can be extended with additional services or middleware.
- **Testing**: Add unit tests (e.g., using Jest) for production use.
- **Security**:
  - Use a strong `JWT_SECRET` in production.
  - Validate Google OAuth credentials and callback URL.
  - Consider rate-limiting and additional security middleware for production.
- **Database**: Ensure the database is running and accessible. Use `npx prisma studio` for a visual database interface during development.

---

## Example Workflow
1. **Client**:
   - Log in via `/auth/google`.
   - Browse workers at `/worker/nearby?lat=<lat>&lon=<lon>` or `/worker/:id`.
   - View services at `/service/worker/:workerId`.
   - Place an order at `/order`, which returns a WhatsApp URL.
2. **Worker**:
   - Log in as `CLIENT`, then upgrade to `WORKER` via `/auth/upgrade-worker`.
   - Update profile at `/worker/profile` (bio, price, skills).
   - Create services at `/service`.
3. **Admin**: Reserved for future implementation (e.g., managing users or orders).

---

## Contact
For issues or contributions, please contact the development team or open an issue on the repository.