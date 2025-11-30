import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Database Module - Abstracts database connection
 * 
 * Supports:
 * - MongoDB (via Mongoose)
 * - PostgreSQL (via TypeORM)
 * - MySQL (via TypeORM)
 * 
 * Switch databases by changing DB_TYPE in .env
 * 
 * Usage:
 * ```typescript
 * @Module({
 *   imports: [DbModule.forRoot()],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class DbModule {
  static forRoot(): DynamicModule {
    const dbType = (process.env.DB_TYPE || 'mongodb').toLowerCase();
    const databaseUri = process.env.DATABASE_URI || this.getDefaultUri(dbType);

    // Return appropriate database module based on DB_TYPE
    if (dbType === 'mongodb') {
      return {
        module: DbModule,
        imports: [
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              uri: configService.get<string>('database.uri') || databaseUri,
            }),
            inject: [ConfigService],
          }),
        ],
        exports: [MongooseModule],
      };
    } else if (dbType === 'postgresql' || dbType === 'postgres') {
      return {
        module: DbModule,
        imports: [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              type: 'postgres',
              url: configService.get<string>('database.uri') || databaseUri,
              autoLoadEntities: true,
              synchronize: configService.get<string>('NODE_ENV') !== 'production',
              logging: configService.get<string>('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
          }),
        ],
        exports: [TypeOrmModule],
      };
    } else if (dbType === 'mysql' || dbType === 'mariadb') {
      return {
        module: DbModule,
        imports: [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              type: 'mysql',
              url: configService.get<string>('database.uri') || databaseUri,
              autoLoadEntities: true,
              synchronize: configService.get<string>('NODE_ENV') !== 'production',
              logging: configService.get<string>('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
          }),
        ],
        exports: [TypeOrmModule],
      };
    } else {
      throw new Error(`Unsupported database type: ${dbType}. Supported: mongodb, postgresql, mysql`);
    }
  }

  private static getDefaultUri(dbType: string): string {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || (dbType === 'mongodb' ? '27017' : dbType === 'postgresql' ? '5432' : '3306');
    const database = process.env.DB_NAME || 'nestjs_app';
    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;

    switch (dbType) {
      case 'mongodb':
        return username && password
          ? `mongodb://${username}:${password}@${host}:${port}/${database}`
          : `mongodb://${host}:${port}/${database}`;
      case 'postgresql':
      case 'postgres':
        return `postgresql://${username || 'postgres'}:${password || ''}@${host}:${port}/${database}`;
      case 'mysql':
      case 'mariadb':
        return `mysql://${username || 'root'}:${password || ''}@${host}:${port}/${database}`;
      default:
        return `mongodb://${host}:${port}/${database}`;
    }
  }

  /**
   * For MongoDB - Register schemas
   */
  static forFeatureMongo(schemas: any[]) {
    return MongooseModule.forFeature(schemas);
  }

  /**
   * For TypeORM - Register entities
   */
  static forFeatureTypeORM(entities: any[]) {
    return TypeOrmModule.forFeature(entities);
  }
}
