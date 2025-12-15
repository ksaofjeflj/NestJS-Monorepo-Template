import { SetMetadata } from '@nestjs/common';
import { CacheOptions } from './interfaces/cache-options.interface';

export const CACHEABLE_KEY = 'cacheable';

/**
 * Cacheable Decorator
 * 
 * Caches the result of a method call.
 * 
 * @example
 * ```typescript
 * @Cacheable({ ttl: 300 })
 * findAll() { ... }
 * 
 * @Cacheable({ ttl: 600, key: (args) => `user:${args.id}` })
 * findOne(id: string) { ... }
 * ```
 */
export const Cacheable = (options: CacheOptions = {}) => {
  return SetMetadata(CACHEABLE_KEY, options);
};
