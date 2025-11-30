import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  type: 'mongodb' | 'postgresql' | 'mysql';
  uri: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

/**
 * Database Configuration
 * 
 * Supports multiple database types:
 * - mongodb: MongoDB connection
 * - postgresql: PostgreSQL connection
 * - mysql: MySQL/MariaDB connection
 * 
 * Environment Variables:
 * - DB_TYPE: Database type (mongodb, postgresql, mysql)
 * - DATABASE_URI: Full connection URI
 * OR
 * - DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
 */
export default registerAs('database', (): DatabaseConfig => {
  const dbTypeRaw = (process.env.DB_TYPE || 'mongodb').toLowerCase();
  
  // Normalize aliases to canonical types
  let dbType: 'mongodb' | 'postgresql' | 'mysql';
  if (dbTypeRaw === 'postgres' || dbTypeRaw === 'postgresql') {
    dbType = 'postgresql';
  } else if (dbTypeRaw === 'mariadb' || dbTypeRaw === 'mysql') {
    dbType = 'mysql';
  } else if (dbTypeRaw === 'mongodb') {
    dbType = 'mongodb';
  } else {
    throw new Error(`Unsupported database type: ${dbTypeRaw}. Supported: mongodb, postgresql, mysql`);
  }

  // If full URI is provided, use it
  if (process.env.DATABASE_URI) {
    return {
      type: dbType,
      uri: process.env.DATABASE_URI,
    };
  }

  // Otherwise, construct from individual parts
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '27017', 10);
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'nestjs_app';

  let uri: string;

  switch (dbType) {
    case 'mongodb':
      if (username && password) {
        uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;
      } else {
        uri = `mongodb://${host}:${port}/${database}`;
      }
      break;

    case 'postgresql':
      uri = `postgresql://${username || 'postgres'}:${password || ''}@${host}:${port}/${database}`;
      break;

    case 'mysql':
      uri = `mysql://${username || 'root'}:${password || ''}@${host}:${port}/${database}`;
      break;

    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }

  return {
    type: dbType,
    uri,
    host,
    port,
    username,
    password,
    database,
  };
});

