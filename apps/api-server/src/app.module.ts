import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DbModule } from '@app/db';
import { SecurityModule, normalRateLimit } from '@app/security';
import { CacheModule, CacheInterceptor } from '@app/cache';
import { databaseConfig, appConfig, jwtConfig, cacheConfig } from '@app/configuration';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig, cacheConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database (automatically selects based on DB_TYPE)
    DbModule.forRoot(),

    // Cache (Redis with in-memory fallback)
    CacheModule.forRoot(),

    // Security middleware (helmet, compression, logging applied automatically)
    SecurityModule,

    // Feature modules
    HealthModule,
    UsersModule,
  ],
  providers: [
    // Apply cache interceptor globally
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply rate limiting selectively to specific routes
    
    // Strict rate limit for auth endpoints (if you add auth later)
    // consumer
    //   .apply(strictRateLimit)
    //   .forRoutes('auth/login', 'auth/register', 'auth/reset-password');

    // Normal rate limit for API endpoints
    consumer
      .apply(normalRateLimit)
      .forRoutes('api/*');

    // No rate limiting for health checks
    // Health endpoint is excluded automatically
  }
}

