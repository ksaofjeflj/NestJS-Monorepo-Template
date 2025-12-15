import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheOptions } from './interfaces/cache-options.interface';
import { CACHEABLE_KEY } from './cacheable.decorator';

/**
 * Cache Interceptor
 * 
 * Intercepts method calls decorated with @Cacheable() and caches the results.
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Get cache options from metadata
    const cacheOptions = this.reflector.get<CacheOptions>(CACHEABLE_KEY, handler);
    
    if (!cacheOptions) {
      return next.handle();
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(
      controller.name,
      handler.name,
      request.params,
      request.query,
      cacheOptions,
    );

    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached !== undefined && cached !== null) {
      return of(cached);
    }

    // Execute handler and cache result
    return next.handle().pipe(
      tap(async (data) => {
        const ttl = cacheOptions.ttl ? cacheOptions.ttl * 1000 : undefined; // Convert to milliseconds
        await this.cacheManager.set(cacheKey, data, ttl);
      }),
    );
  }

  private generateCacheKey(
    className: string,
    methodName: string,
    params: any,
    query: any,
    options: CacheOptions,
  ): string {
    const prefix = options.keyPrefix || 'nestjs';
    
    if (options.key) {
      if (typeof options.key === 'function') {
        // Combine params and query for key function
        const args = { ...params, ...query };
        const keyResult = options.key(args);
        return `${prefix}:${keyResult}`;
      }
      return `${prefix}:${options.key}`;
    }

    // Auto-generate key
    const paramsKey = Object.keys(params).length > 0 ? `:${JSON.stringify(params)}` : '';
    const queryKey = Object.keys(query).length > 0 ? `:${JSON.stringify(query)}` : '';
    
    return `${prefix}:${className}:${methodName}${paramsKey}${queryKey}`;
  }
}

