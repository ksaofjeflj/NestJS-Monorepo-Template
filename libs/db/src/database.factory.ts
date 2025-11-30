import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

export enum DatabaseType {
  MONGODB = 'mongodb',
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
}

/**
 * Database Factory - Creates appropriate database connection
 * based on configuration
 */
@Injectable()
export class DatabaseFactory {
  static createConnection(configService: ConfigService) {
    const dbType = (configService.get<string>('database.type') || 'mongodb').toLowerCase();

    switch (dbType) {
      case DatabaseType.MONGODB:
        return MongooseModule.forRootAsync({
          imports: [ConfigService],
          useFactory: (config: ConfigService) => ({
            uri: config.get<string>('database.uri'),
          }),
          inject: [ConfigService],
        });

      case DatabaseType.POSTGRESQL:
      case 'postgres':
        return TypeOrmModule.forRootAsync({
          imports: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            url: config.get<string>('database.uri'),
            autoLoadEntities: true,
            synchronize: config.get<string>('NODE_ENV') !== 'production',
            logging: config.get<string>('NODE_ENV') === 'development',
          }),
          inject: [ConfigService],
        });

      case DatabaseType.MYSQL:
      case 'mariadb':
        return TypeOrmModule.forRootAsync({
          imports: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'mysql',
            url: config.get<string>('database.uri'),
            autoLoadEntities: true,
            synchronize: config.get<string>('NODE_ENV') !== 'production',
            logging: config.get<string>('NODE_ENV') === 'development',
          }),
          inject: [ConfigService],
        });

      default:
        throw new Error(`Unsupported database type: ${dbType}. Supported: mongodb, postgresql, mysql`);
    }
  }
}

