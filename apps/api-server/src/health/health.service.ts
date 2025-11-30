import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';

/**
 * Health Service
 * 
 * Provides health check information including:
 * - Application status
 * - Database connectivity
 * - System information
 */
@Injectable()
export class HealthService {
  private mongooseConnection?: Connection;
  private typeOrmDataSource?: DataSource;

  constructor(private readonly configService: ConfigService) {
    // Connections will be set via setter methods from HealthModule
  }

  /**
   * Set MongoDB connection (called after module initialization)
   */
  setMongoConnection(connection?: Connection) {
    this.mongooseConnection = connection;
  }

  /**
   * Set TypeORM connection (called after module initialization)
   */
  setTypeOrmConnection(dataSource?: DataSource) {
    this.typeOrmDataSource = dataSource;
  }

  /**
   * Get basic health check information
   */
  async getHealth() {
    const dbType = this.configService.get<string>('database.type') || 'mongodb';
    const dbStatus = await this.checkDatabase(dbType);

    return {
      status: dbStatus.connected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get<string>('app.env') || 'development',
      database: {
        type: dbType,
        status: dbStatus.connected ? 'connected' : 'disconnected',
        responseTime: dbStatus.responseTime,
        error: dbStatus.error,
      },
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        unit: 'MB',
      },
    };
  }

  /**
   * Check database connectivity based on database type
   */
  private async checkDatabase(dbType: string): Promise<{
    connected: boolean;
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      switch (dbType) {
        case 'mongodb':
          return await this.checkMongoDB(startTime);
        case 'postgresql':
        case 'postgres':
          return await this.checkPostgreSQL(startTime);
        case 'mysql':
        case 'mariadb':
          return await this.checkMySQL(startTime);
        default:
          return {
            connected: false,
            error: `Unsupported database type: ${dbType}`,
          };
      }
    } catch (error) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check MongoDB connectivity
   */
  private async checkMongoDB(startTime: number): Promise<{
    connected: boolean;
    responseTime: number;
    error?: string;
  }> {
    // Try to get connection dynamically
    let connection: Connection | undefined = this.mongooseConnection;
    
    if (!connection) {
      // Try to import mongoose and get default connection
      try {
        const mongoose = await import('mongoose');
        connection = mongoose.connection;
      } catch {
        return {
          connected: false,
          responseTime: Date.now() - startTime,
          error: 'MongoDB connection not available',
        };
      }
    }

    if (!connection || connection.readyState !== 1) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        error: 'MongoDB connection not ready',
      };
    }

    try {
      // Ping the database
      await connection.db.admin().ping();
      return {
        connected: true,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'MongoDB ping failed',
      };
    }
  }

  /**
   * Check PostgreSQL/MySQL connectivity (TypeORM)
   */
  private async checkPostgreSQL(startTime: number): Promise<{
    connected: boolean;
    responseTime: number;
    error?: string;
  }> {
    return this.checkTypeORM(startTime);
  }

  private async checkMySQL(startTime: number): Promise<{
    connected: boolean;
    responseTime: number;
    error?: string;
  }> {
    return this.checkTypeORM(startTime);
  }

  /**
   * Check TypeORM database connectivity (PostgreSQL/MySQL)
   */
  private async checkTypeORM(startTime: number): Promise<{
    connected: boolean;
    responseTime: number;
    error?: string;
  }> {
    let dataSource: DataSource | undefined = this.typeOrmDataSource;
    
    if (!dataSource) {
      // Try to get DataSource from TypeORM
      try {
        await import('typeorm');
        // Note: In a real scenario, you'd get this from the module
        // For now, we'll check if we can connect via the URI
        return {
          connected: false,
          responseTime: Date.now() - startTime,
          error: 'TypeORM DataSource not available - connection check skipped',
        };
      } catch {
        return {
          connected: false,
          responseTime: Date.now() - startTime,
          error: 'TypeORM not available',
        };
      }
    }

    if (!dataSource.isInitialized) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        error: 'TypeORM DataSource not initialized',
      };
    }

    try {
      // Run a simple query to check connectivity
      await dataSource.query('SELECT 1');
      return {
        connected: true,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Database query failed',
      };
    }
  }
}

