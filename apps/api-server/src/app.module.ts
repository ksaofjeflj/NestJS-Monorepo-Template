import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '@app/db';
import { databaseConfig, appConfig, jwtConfig } from '@app/configuration';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database (automatically selects based on DB_TYPE)
    DbModule.forRoot(),

    // Feature modules
    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}

