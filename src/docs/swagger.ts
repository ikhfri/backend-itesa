// src/docs/swagger.ts
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    version: "1.0.0",
    title: "Serabutan API",
    description:
      "RESTful API for a service marketplace similar to Fastwork.id, supporting Google OAuth authentication, role-based access (CLIENT, WORKER, ADMIN), and features like worker profile management, service creation, order placement via WhatsApp, and location-based worker search using the Haversine formula.",
  },
  host: "localhost:3000",
  schemes: ["http"],
  securityDefinitions: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  definitions: {
    User: {
      id: "uuid-string",
      name: "John Doe",
      email: "john@example.com",
      role: "CLIENT",
      phone: "1234567890",
      createdAt: "2025-09-22T11:02:00Z",
      updatedAt: "2025-09-22T11:02:00Z",
    },
    Worker: {
      id: "uuid-string",
      userId: "uuid-string",
      bio: "Experienced handyman specializing in plumbing",
      price: 50.0,
      skills: [{ skill: { id: "uuid-string", name: "Plumbing" } }],
      services: [{ id: "uuid-string", title: "Pipe Repair", price: 30.0 }],
      createdAt: "2025-09-22T11:02:00Z",
      updatedAt: "2025-09-22T11:02:00Z",
    },
    Service: {
      id: "uuid-string",
      workerId: "uuid-string",
      title: "Pipe Repair",
      description: "Fixing leaks and pipe issues",
      price: 30.0,
      createdAt: "2025-09-22T11:02:00Z",
      updatedAt: "2025-09-22T11:02:00Z",
    },
    Order: {
      id: "uuid-string",
      clientId: "uuid-string",
      workerId: "uuid-string",
      serviceDate: "2025-09-23T10:00:00Z",
      status: "PENDING",
      note: "Please bring tools",
      createdAt: "2025-09-22T11:02:00Z",
      updatedAt: "2025-09-22T11:02:00Z",
    },
    Location: {
      id: "uuid-string",
      userId: "uuid-string",
      latitude: -6.1751,
      longitude: 106.865,
      address: "Jakarta, Indonesia",
      createdAt: "2025-09-22T11:02:00Z",
      updatedAt: "2025-09-22T11:02:00Z",
    },
    WorkerProfileInput: {
      bio: "Experienced handyman",
      price: 50.0,
      phone: "1234567890",
      skills: ["Plumbing", "Electrical"],
    },
    ServiceInput: {
      title: "Pipe Repair",
      description: "Fixing leaks and pipe issues",
      price: 30.0,
    },
    OrderInput: {
      workerId: "uuid-string",
      serviceDate: "2025-09-23T10:00:00Z",
      note: "Please bring tools",
    },
    LocationInput: {
      latitude: -6.1751,
      longitude: 106.865,
      address: "Jakarta, Indonesia",
    },
    ErrorResponse: {
      message: "Error message",
    },
  },
};

// Manually defined endpoints for better control and detail
const endpointsFiles = [
  "./src/routes/auth.routes.ts",
  "./src/routes/worker.routes.ts",
  "./src/routes/service.routes.ts",
  "./src/routes/order.routes.ts",
  "./src/routes/location.routes.ts",
];

const outputFile = "./swagger.json";

// Additional manual Swagger definitions to ensure completeness
const swaggerDefinition = {
  paths: {
    "/auth/google": {
      get: {
        tags: ["Auth"],
        summary: "Initiate Google OAuth login",
        description:
          "Redirects to Google OAuth for user authentication. On success, redirects to callback URL.",
        responses: {
          302: {
            description: "Redirect to Google OAuth",
          },
        },
      },
    },
    "/auth/google/callback": {
      get: {
        tags: ["Auth"],
        summary: "Handle Google OAuth callback",
        description:
          "Handles the callback from Google OAuth, returning a JWT token on success.",
        responses: {
          200: {
            description: "Successful authentication",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication failed",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/upgrade-worker": {
      post: {
        tags: ["Auth"],
        summary: "Upgrade user to WORKER role",
        description:
          "Upgrades a CLIENT to WORKER role, creating a Worker profile.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Successfully upgraded to WORKER",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    worker: { $ref: "#/definitions/Worker" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid role or already upgraded",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/worker/profile": {
      get: {
        tags: ["Worker"],
        summary: "Get worker profile",
        description:
          "Retrieves the authenticated worker’s profile, including user details, skills, and services.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Worker profile",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/Worker" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Worker not found",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Worker"],
        summary: "Update worker profile",
        description:
          "Updates the authenticated worker’s profile (bio, price, phone, skills).",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/WorkerProfileInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated worker profile",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/Worker" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/worker/{id}": {
      get: {
        tags: ["Worker"],
        summary: "Get worker by ID",
        description:
          "Retrieves a worker’s profile by their ID, including user details, skills, and services.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Worker profile",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/Worker" },
              },
            },
          },
          404: {
            description: "Worker not found",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/worker/nearby": {
      get: {
        tags: ["Worker"],
        summary: "Get nearby workers",
        description:
          "Finds workers within a specified distance using the Haversine formula.",
        parameters: [
          {
            name: "lat",
            in: "query",
            required: true,
            schema: { type: "number" },
          },
          {
            name: "lon",
            in: "query",
            required: true,
            schema: { type: "number" },
          },
          {
            name: "maxDistance",
            in: "query",
            required: false,
            schema: { type: "number", default: 10 },
          },
        ],
        responses: {
          200: {
            description: "List of nearby workers",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/definitions/Worker" },
                },
              },
            },
          },
          400: {
            description: "Missing latitude or longitude",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/service": {
      post: {
        tags: ["Service"],
        summary: "Create a new service",
        description: "Creates a new service for the authenticated worker.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/ServiceInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Created service",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/Service" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Worker not found",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/service/{id}": {
      put: {
        tags: ["Service"],
        summary: "Update a service",
        description: "Updates an existing service by ID.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/ServiceInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated service",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/Service" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Service"],
        summary: "Delete a service",
        description: "Deletes a service by ID.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Service deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/service/worker/{workerId}": {
      get: {
        tags: ["Service"],
        summary: "Get services by worker ID",
        description: "Retrieves all services offered by a specific worker.",
        parameters: [
          {
            name: "workerId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "List of services",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/definitions/Service" },
                },
              },
            },
          },
        },
      },
    },
    "/order": {
      post: {
        tags: ["Order"],
        summary: "Create an order",
        description:
          "Creates a new order and returns a WhatsApp URL for communication with the worker.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/OrderInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Order created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    order: { $ref: "#/definitions/Order" },
                    whatsappUrl: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/location/upsert": {
      post: {
        tags: ["Location"],
        summary: "Create or update user location",
        description: "Creates or updates the authenticated user’s location.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/definitions/LocationInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Location created or updated",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/Location" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/location/nearby": {
      get: {
        tags: ["Location"],
        summary: "Get nearby locations",
        description:
          "Finds locations within a specified distance using the Haversine formula.",
        parameters: [
          {
            name: "lat",
            in: "query",
            required: true,
            schema: { type: "number" },
          },
          {
            name: "lon",
            in: "query",
            required: true,
            schema: { type: "number" },
          },
          {
            name: "maxDistance",
            in: "query",
            required: false,
            schema: { type: "number", default: 10 },
          },
        ],
        responses: {
          200: {
            description: "List of nearby locations",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/definitions/Location" },
                },
              },
            },
          },
          400: {
            description: "Missing latitude or longitude",
            content: {
              "application/json": {
                schema: { $ref: "#/definitions/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

// Merge manual definitions with autogen
swaggerAutogen(outputFile, endpointsFiles, {
  ...doc,
  paths: swaggerDefinition.paths,
});
