# Environment Validation Guide

This guide explains the Joi-based environment validation system that provides fail-fast startup validation.

## Overview

The environment validation system uses **Joi** to validate all environment variables before the application starts. If validation fails, the application **will not start**, preventing runtime errors from misconfiguration.

## Features

- ✅ **Fail-fast validation** - Application won't start with invalid config
- ✅ **Detailed error messages** - Shows exactly what's wrong
- ✅ **Environment-specific rules** - Stricter validation in production
- ✅ **Type conversion** - Automatically converts strings to numbers, etc.
- ✅ **Default values** - Provides sensible defaults for optional variables

## How It Works

### Automatic Validation

Validation happens automatically when you import `ConfigModule`:

```typescript
import { ConfigModule } from '@nestjs/config';
import { getJoiValidationSchema } from '@app/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: getJoiValidationSchema(), // ← Automatic validation
      validationOptions: {
        abortEarly: false, // Show all errors
        allowUnknown: true, // Allow unknown env vars
        stripUnknown: false, // Keep unknown vars
      },
    }),
  ],
})
export class AppModule {}
```

### Manual Validation

You can also validate manually before starting the app:

```typescript
import { validateEnvByNodeEnv } from '@app/configuration';

async function bootstrap() {
  // Validate before starting
  try {
    validateEnvByNodeEnv(process.env);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  
  // Start app...
}
```

## Validation Rules

### Development Environment

Most variables are **optional** with sensible defaults:

```env
# Optional - defaults provided
NODE_ENV=development
DB_TYPE=mongodb
APP_NAME=NestJS App
API_PREFIX=api
```

### Production Environment

**Stricter validation** - Required variables must be set:

```env
# Required in production
NODE_ENV=production
DATABASE_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-secret-key-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
```

## Environment Variables

### Database

```env
# Required in production
DATABASE_URI=mongodb://localhost:27017/myapp

# OR use individual parts
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_USERNAME=user
DB_PASSWORD=pass
DB_NAME=myapp
```

**Validation:**
- `DATABASE_URI` must be a valid URI
- `DB_TYPE` must be: `mongodb`, `postgresql`, `postgres`, `mysql`, `mariadb`
- `DB_PORT` must be a valid port number (1-65535)

### Application

```env
APP_NAME=My App
PORT=3000
API_SERVER_PORT=3001
WEBSOCKET_PORT=3002
ADMIN_PORT=3003
API_PREFIX=api
```

**Validation:**
- Ports must be valid port numbers
- `API_PREFIX` defaults to `api`

### JWT

```env
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

**Validation:**
- **Production**: `JWT_SECRET` and `JWT_REFRESH_SECRET` are **required** and must be at least 32 characters
- **Development**: Optional (but recommended)

### Redis/Cache

```env
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_TTL=3600
REDIS_DB=0
REDIS_KEY_PREFIX=nestjs:
REDIS_MAX=100
```

**Validation:**
- `REDIS_ENABLED` must be `true` or `false`
- `REDIS_PORT` must be a valid port number
- `REDIS_TTL` must be a positive integer (seconds)
- `REDIS_DB` must be a non-negative integer

### CORS

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true
```

**Validation:**
- `CORS_CREDENTIALS` must be `true` or `false`

### Swagger

```env
ENABLE_SWAGGER=true
SWAGGER_PATH=api-docs
SWAGGER_TITLE=My API
SWAGGER_DESCRIPTION=API Documentation
SWAGGER_VERSION=1.0
```

**Validation:**
- `ENABLE_SWAGGER` must be `true` or `false`

## Error Messages

### Example: Missing Required Variable

```
Environment validation failed:
DATABASE_URI: "DATABASE_URI" is required

Please check your .env file and ensure all required variables are set correctly.
See .env.example for reference.
```

### Example: Invalid Value

```
Environment validation failed:
REDIS_PORT: "REDIS_PORT" must be a number
JWT_SECRET: "JWT_SECRET" length must be at least 32 characters long

Please check your .env file and ensure all required variables are set correctly.
See .env.example for reference.
```

### Example: Production Validation

```
Environment validation failed:
JWT_SECRET: "JWT_SECRET" is required in production
JWT_REFRESH_SECRET: "JWT_REFRESH_SECRET" is required in production

Please check your .env file and ensure all required variables are set correctly.
See .env.example for reference.
```

## Production Warnings

In production, the validator also warns about potentially insecure configurations:

```
[EnvValidation] Production configuration warnings:
  - JWT_SECRET is using default value - change this in production!
  - CORS_ORIGIN is set to * (allows all origins) - consider restricting this
  - Redis is disabled - consider enabling for production scalability
Please review your environment configuration.
```

## Best Practices

### 1. Use .env Files

Create `.env` files for different environments:

```bash
# .env.development
NODE_ENV=development
DATABASE_URI=mongodb://localhost:27017/myapp_dev

# .env.production
NODE_ENV=production
DATABASE_URI=mongodb://prod-server:27017/myapp
JWT_SECRET=your-production-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars
```

### 2. Never Commit Secrets

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

### 3. Provide .env.example

Create `.env.example` with all variables (without values):

```env
# Database
DATABASE_URI=mongodb://localhost:27017/myapp
DB_TYPE=mongodb

# JWT
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters

# Redis (optional)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Validate Early

Validation happens automatically, but you can also validate manually:

```typescript
// In main.ts - before starting app
validateEnvByNodeEnv(process.env);
```

## Troubleshooting

### Application Won't Start

**Problem**: Application exits immediately with validation error.

**Solution**: Check the error message and fix the invalid environment variable:

```bash
# Error says: REDIS_PORT must be a number
# Fix:
REDIS_PORT=6379  # Not "6379" (string)
```

### Production Validation Too Strict

**Problem**: Development works but production fails.

**Solution**: Ensure all required production variables are set:

```env
NODE_ENV=production
DATABASE_URI=...
JWT_SECRET=...  # Required in production
JWT_REFRESH_SECRET=...  # Required in production
```

### Unknown Environment Variables

**Problem**: Warning about unknown variables.

**Solution**: This is normal - unknown variables are allowed. If you want to validate them, add them to the schema.

## Custom Validation

To add custom validation rules, edit `libs/configuration/src/env.validation.ts`:

```typescript
const baseSchema = Joi.object({
  // Add your custom variable
  MY_CUSTOM_VAR: Joi.string()
    .required()
    .min(10)
    .description('My custom variable'),
});
```

## Related Documentation

- [Configuration Guide](./README.md)
- [Database Switching Guide](./DATABASE_SWITCHING_GUIDE.md)
- [Cache Guide](./CACHE_GUIDE.md)

