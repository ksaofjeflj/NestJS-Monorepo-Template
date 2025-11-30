import { Module, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule implements OnModuleInit {
  constructor(
    private readonly healthService: HealthService,
    private readonly configService: ConfigService,
    @Optional() @InjectConnection() private readonly mongoConnection?: Connection,
    @Optional() @InjectDataSource() private readonly typeOrmDataSource?: DataSource,
  ) {}

  async onModuleInit() {
    const dbType = this.configService.get<string>('database.type') || 'mongodb';

    if (dbType === 'mongodb' && this.mongoConnection) {
      this.healthService.setMongoConnection(this.mongoConnection);
    } else if (this.typeOrmDataSource) {
      this.healthService.setTypeOrmConnection(this.typeOrmDataSource);
    }
  }
}

