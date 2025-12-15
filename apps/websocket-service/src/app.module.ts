import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '@app/db';
import { databaseConfig, appConfig, getJoiValidationSchema } from '@app/configuration';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    // Configuration with Joi validation (fail-fast)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
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

    // Feature modules
    EventsModule,
  ],
})
export class AppModule {}

