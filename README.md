# Hono.js Cloudflare Workers REST API Boilerplate

A production-ready REST API boilerplate using Hono.js for Cloudflare Workers with a modular architecture inspired by NestJS.

## Features

- 🚀 **Hono.js** - Fast and lightweight web framework
- ☁️ **Cloudflare Workers** - Serverless execution environment
- 🏗️ **Modular Architecture** - NestJS-inspired module system
- 🔄 **Dependency Injection** - Custom DI container
- ✅ **Type Safety** - Full TypeScript support
- 🛡️ **Validation** - Request validation with Zod
- 🔐 **Authentication** - JWT/Bearer token middleware
- 📝 **Error Handling** - Centralized error handling
- 🗄️ **Database Ready** - D1 and KV namespace support
- 📊 **Logging** - Request logging middleware
- 🌐 **CORS** - Cross-origin resource sharing
- 📚 **Documentation** - Well-documented codebase

## Project Structure

```
src/
├── types/           # TypeScript type definitions
├── shared/          # Shared utilities and middleware
│   ├── container/   # Dependency injection container
│   ├── decorators/  # Custom decorators
│   ├── middleware/  # Global middleware
│   └── utils/       # Utility functions
├── modules/         # Feature modules
│   └── users/       # User module example
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── dto/
│       ├── entities/
│       └── routes/
├── app.ts          # Application setup
└── index.ts        # Worker entry point
```

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Cloudflare:**

   - Update `wrangler.jsonc` with your account details
   - Set up D1 database and KV namespace (optional)

3. **Development:**

   ```bash
   npm run dev
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## Creating New Modules

1. Create module structure in `src/modules/your-module/`
2. Implement entities, DTOs, repositories, services, and controllers
3. Create routes and register dependencies in module class
4. Register module in `app.ts`

## API Endpoints

- `GET /health` - Health check
- `GET /api/v1/users` - Get all users (paginated)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user (requires auth)
- `PUT /api/v1/users/:id` - Update user (requires auth)
- `DELETE /api/v1/users/:id` - Delete user (requires auth)

## Environment Variables

Configure in `wrangler.jsonc` or Cloudflare dashboard:

- `ENVIRONMENT` - Deployment environment
- `DB` - D1 database binding
- `CACHE` - KV namespace binding

## Authentication

Include Bearer token in Authorization header:

```
Authorization: Bearer your-token-here
```

## Response Format

All API responses follow this structure:

```typescript
{
  "success": boolean,
  "data"?: any,
  "message"?: string,
  "error"?: string,
  "pagination"?: {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

## Contributing

1. Follow the modular architecture patterns
2. Add proper TypeScript types
3. Include validation for all inputs
4. Write meaningful error messages
5. Update documentation
