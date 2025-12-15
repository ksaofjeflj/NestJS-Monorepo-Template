import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '@app/db';
import { SecurityModule, strictRateLimit } from '@app/security';
import { databaseConfig, appConfig, jwtConfig, getJoiValidationSchema } from '@app/configuration';
import { HealthModule } from './health/health.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Configuration with Joi validation (fail-fast)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
      validationSchema: getJoiValidationSchema(),
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: false,
      },
    }),

    // Database
    DbModule.forRoot(),

    // Security middleware (helmet, compression, logging applied automatically)
    SecurityModule,

    // Feature modules
    HealthModule,
    AdminModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply strict rate limiting to admin endpoints
    // Admin panel should have stricter limits
    consumer
      .apply(strictRateLimit)
      .forRoutes('admin/*');

    // No rate limiting for health checks
  }
}

