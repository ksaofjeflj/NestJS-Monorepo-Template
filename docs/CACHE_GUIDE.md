# Cache Guide

This guide explains how to use the optional Redis cache layer with `@Cacheable()` decorators in the NestJS monorepo template.

## Overview

The cache system provides:
- **Redis caching** (when enabled) for distributed caching across multiple instances
- **In-memory fallback** when Redis is disabled or unavailable
- **Easy-to-use decorators** for method-level caching
- **Automatic cache key generation** or custom keys
- **Configurable TTL** (Time To Live) per method

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Enable Redis cache (default: false)
REDIS_ENABLED=true

# Redis connection settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password  # Optional
REDIS_DB=0                          # Optional, default: 0
REDIS_TTL=3600                      # Default TTL in seconds (default: 3600)
REDIS_KEY_PREFIX=nestjs:            # Prefix for all cache keys (default: nestjs:)
REDIS_MAX=100                        # Max items for in-memory cache (default: 100)
```

### Docker Compose

Redis is included in `docker-compose.yml`. To use it:

```bash
docker-compose up redis
```

Or start all services:

```bash
docker-compose up
```

## Usage

### Basic Usage

Use the `@Cacheable()` decorator on controller methods:

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { Cacheable } from '@app/cache';

@Controller('users')
export class UsersController {
  @Get()
  @Cacheable({ ttl: 300 }) // Cache for 5 minutes
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Cacheable({ ttl: 600, key: (args) => `user:${args.id}` })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

### Cache Options

The `@Cacheable()` decorator accepts the following options:

```typescript
interface CacheOptions {
  /**
   * Time to live in seconds
   * @default 3600 (1 hour)
   */
  ttl?: number;

  /**
   * Cache key
   * Can be a string or a function that receives request params/query
   * @default Auto-generated from class name, method name, and arguments
   */
  key?: string | ((args: any) => string);

  /**
   * Key prefix (overrides global prefix)
   * @default Uses global prefix from cache config
   */
  keyPrefix?: string;
}
```

### Examples

#### 1. Simple Caching with Auto-Generated Key

```typescript
@Get()
@Cacheable({ ttl: 300 })
findAll() {
  // Cache key: nestjs:UsersController:findAll
  return this.service.findAll();
}
```

#### 2. Custom String Key

```typescript
@Get()
@Cacheable({ ttl: 300, key: 'all-users' })
findAll() {
  // Cache key: nestjs:all-users
  return this.service.findAll();
}
```

#### 3. Dynamic Key from Parameters

```typescript
@Get(':id')
@Cacheable({ ttl: 600, key: (args) => `user:${args.id}` })
findOne(@Param('id') id: string) {
  // Cache key: nestjs:user:123 (if id = '123')
  return this.service.findOne(id);
}
```

#### 4. Complex Dynamic Key

```typescript
@Get('search')
@Cacheable({ 
  ttl: 300, 
  key: (args) => `search:${args.query}:${args.page}:${args.limit}` 
})
search(@Query('query') query: string, @Query('page') page: number) {
  // Cache key: nestjs:search:john:1:10
  return this.service.search(query, page);
}
```

### Manual Cache Operations

You can also use `CacheService` directly for manual cache operations:

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '@app/cache';

@Injectable()
export class MyService {
  constructor(private readonly cacheService: CacheService) {}

  async getData(key: string) {
    // Try to get from cache
    const cached = await this.cacheService.get(key);
    if (cached) {
      return cached;
    }

    // Fetch from source
    const data = await this.fetchFromSource();
    
    // Store in cache
    await this.cacheService.set(key, data, 3600); // 1 hour TTL
    
    return data;
  }

  async invalidateCache(key: string) {
    await this.cacheService.del(key);
  }

  async clearAllCache() {
    await this.cacheService.reset();
  }
}
```

## Cache Invalidation

### Manual Invalidation

```typescript
import { CacheService } from '@app/cache';

@Injectable()
export class UsersService {
  constructor(private readonly cacheService: CacheService) {}

  async updateUser(id: string, data: any) {
    const user = await this.repository.update(id, data);
    
    // Invalidate cache for this user
    await this.cacheService.del(`user:${id}`);
    await this.cacheService.del('users:all'); // Invalidate list cache
    
    return user;
  }
}
```

### Pattern-Based Invalidation

```typescript
// Note: This requires Redis and custom implementation
// For now, you need to track keys manually or use a key pattern

async invalidateUserCache(userId: string) {
  await this.cacheService.del(`user:${userId}`);
  await this.cacheService.del('users:all');
  // Add other related cache keys
}
```

## Best Practices

### 1. Choose Appropriate TTL

- **Short TTL (60-300s)**: Frequently changing data, real-time data
- **Medium TTL (300-3600s)**: Moderately changing data, user profiles
- **Long TTL (3600-86400s)**: Rarely changing data, configuration, static content

### 2. Use Descriptive Cache Keys

```typescript
// Good
@Cacheable({ key: 'users:active:count' })

// Bad
@Cacheable({ key: 'data' })
```

### 3. Cache Read-Heavy Operations

Cache operations that:
- Are called frequently
- Are expensive (database queries, API calls)
- Don't change often
- Don't require real-time accuracy

### 4. Don't Cache Everything

Avoid caching:
- User-specific sensitive data (unless properly isolated)
- Frequently changing data with short TTLs
- Operations that are already fast
- Write operations (POST, PUT, DELETE)

### 5. Handle Cache Failures Gracefully

The cache system automatically falls back to in-memory cache if Redis is unavailable. Your application will continue to work, just without distributed caching.

## Health Check

The health endpoint (`/health`) includes cache status:

```json
{
  "status": "ok",
  "cache": {
    "enabled": true,
    "type": "redis",
    "status": "connected",
    "responseTime": 5
  }
}
```

## Troubleshooting

### Cache Not Working

1. **Check Redis is running**:
   ```bash
   docker-compose ps redis
   redis-cli ping
   ```

2. **Verify configuration**:
   ```bash
   # Check environment variables
   echo $REDIS_ENABLED
   echo $REDIS_HOST
   ```

3. **Check logs**:
   ```bash
   docker-compose logs api-server
   ```

### Redis Connection Errors

If Redis connection fails, the system automatically falls back to in-memory cache. Check:
- Redis is running and accessible
- Network connectivity
- Redis password (if configured)
- Firewall rules

### Cache Keys Not Matching

Ensure consistent key generation:
- Use the same key format for related operations
- Include all relevant parameters in dynamic keys
- Use consistent prefixes

## Performance Considerations

### When to Use Redis

- Multiple application instances (horizontal scaling)
- Need for shared cache across services
- Large cache size requirements
- Cache persistence across restarts

### When In-Memory Cache is Sufficient

- Single application instance
- Small cache size
- Development/testing environments
- Cache persistence not required

## Examples

See `apps/api-server/src/users/users.controller.ts` for a complete example with:
- Cached list endpoint
- Cached detail endpoint
- Custom cache keys

## Additional Resources

- [NestJS Caching](https://docs.nestjs.com/techniques/caching)
- [Redis Documentation](https://redis.io/docs/)
- [cache-manager Documentation](https://github.com/node-cache-manager/node-cache-manager)

