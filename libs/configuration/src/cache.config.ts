import { registerAs } from '@nestjs/config';

export interface CacheConfig {
  enabled: boolean;
  host: string;
  port: number;
  password?: string;
  ttl: number; // Default TTL in seconds
  max?: number; // Maximum number of items in cache (for in-memory fallback)
  db?: number; // Redis database number
  keyPrefix?: string; // Prefix for all cache keys
}

/**
 * Cache Configuration
 * 
 * Supports Redis caching with in-memory fallback.
 * Cache is optional - if Redis is disabled, falls back to in-memory cache.
 * 
 * Environment Variables:
 * - REDIS_ENABLED: Enable Redis cache (default: false)
 * - REDIS_HOST: Redis host (default: localhost)
 * - REDIS_PORT: Redis port (default: 6379)
 * - REDIS_PASSWORD: Redis password (optional)
 * - REDIS_TTL: Default TTL in seconds (default: 3600)
 * - REDIS_DB: Redis database number (default: 0)
 * - REDIS_KEY_PREFIX: Prefix for all cache keys (default: nestjs:)
 */
export default registerAs('cache', (): CacheConfig => {
  const enabled = process.env.REDIS_ENABLED === 'true';
  
  return {
    enabled,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
    max: process.env.REDIS_MAX ? parseInt(process.env.REDIS_MAX, 10) : undefined,
    db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'nestjs:',
  };
});

