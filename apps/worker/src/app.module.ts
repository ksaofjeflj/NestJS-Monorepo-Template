import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '@app/db';
import { CacheModule } from '@app/cache';
import { databaseConfig, cacheConfig, getJoiValidationSchema } from '@app/configuration';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    // Configuration with Joi validation (fail-fast)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, cacheConfig],
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

    // Cache (for distributed locking)
    CacheModule.forRoot(),

    // Feature modules
    TasksModule,
  ],
})
export class AppModule {}

