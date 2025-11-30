import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '@app/db';
import { databaseConfig, appConfig, jwtConfig } from '@app/configuration';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    DbModule.forRoot(),

    // Feature modules
    HealthModule,
    // Add your admin modules here (auth, users, etc.)
  ],
})
export class AppModule {}

