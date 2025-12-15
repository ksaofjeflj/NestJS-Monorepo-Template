import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Cache Service
 * 
 * Provides methods for cache operations:
 * - get: Retrieve cached value
 * - set: Store value in cache
 * - del: Delete cached value
 * - reset: Clear all cache
 */
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Clear all cache
   * Note: This method may not be available in all cache stores
   */
  async reset(): Promise<void> {
    // Try to reset if available, otherwise do nothing
    if (typeof (this.cacheManager as any).reset === 'function') {
      await (this.cacheManager as any).reset();
    } else if (typeof (this.cacheManager as any).store?.reset === 'function') {
      await (this.cacheManager as any).store.reset();
    }
    // If reset is not available, cache will expire naturally based on TTL
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return !!this.cacheManager;
  }
}

