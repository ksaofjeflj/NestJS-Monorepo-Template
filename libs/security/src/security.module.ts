import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HelmetMiddleware } from './middleware/helmet.middleware';
import { CompressionMiddleware } from './middleware/compression.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';

/**
 * Security Module
 * 
 * Provides production-ready security middleware:
 * - Helmet: Security headers
 * - Compression: Response compression
 * - Logger: Request/response logging
 * - Rate Limiting: API abuse protection (optional - apply selectively)
 * 
 * Usage (with global rate limiting):
 * ```typescript
 * @Module({
 *   imports: [SecurityModule],
 * })
 * export class AppModule {}
 * ```
 * 
 * Usage (selective rate limiting):
 * ```typescript
 * @Module({
 *   imports: [SecurityModule],
 * })
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     // Apply security middleware (without rate limiting globally)
 *     consumer
 *       .apply(
 *         HelmetMiddleware,
 *         CompressionMiddleware,
 *         LoggerMiddleware,
 *       )
 *       .forRoutes('*');
 *     
 *     // Apply rate limiting to specific routes
 *     consumer
 *       .apply(RateLimitMiddleware)
 *       .forRoutes('api/auth/*', 'api/users/*');
 *   }
 * }
 * ```
 */
@Module({
  providers: [
    HelmetMiddleware,
    CompressionMiddleware,
    LoggerMiddleware,
    RateLimitMiddleware,
  ],
  exports: [
    HelmetMiddleware,
    CompressionMiddleware,
    LoggerMiddleware,
    RateLimitMiddleware,
  ],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middleware (without rate limiting by default)
    // Rate limiting should be applied selectively to specific routes
    consumer
      .apply(
        HelmetMiddleware,
        CompressionMiddleware,
        LoggerMiddleware,
        // RateLimitMiddleware - Commented out - apply selectively instead
      )
      .forRoutes('*');
  }
}

