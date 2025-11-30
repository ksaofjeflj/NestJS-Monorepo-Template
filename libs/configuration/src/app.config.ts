import { registerAs } from '@nestjs/config';

export interface AppConfig {
  name: string;
  port: number;
  env: string;
  apiPrefix: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

/**
 * Application Configuration
 * 
 * Port Configuration:
 * - PORT: Default port (used if app-specific port not set)
 * - API_SERVER_PORT: Port for api-server app
 * - WEBSOCKET_PORT: Port for websocket-service app
 * - ADMIN_PORT: Port for admin app
 * 
 * Each app can have its own port via environment variable
 */
export default registerAs('app', (): AppConfig => {
  // Get app name from process.env or infer from cwd
  const appName = process.env.APP_NAME || 
    (process.env.npm_lifecycle_event?.includes('api-server') ? 'api-server' :
     process.env.npm_lifecycle_event?.includes('websocket') ? 'websocket-service' :
     process.env.npm_lifecycle_event?.includes('admin') ? 'admin' :
     'nestjs-app');

  // App-specific port configuration
  let port: number;
  if (appName.includes('api-server') || appName === 'api-server') {
    port = parseInt(process.env.API_SERVER_PORT || process.env.PORT || '3001', 10);
  } else if (appName.includes('websocket') || appName.includes('ws')) {
    port = parseInt(process.env.WEBSOCKET_PORT || process.env.PORT || '3002', 10);
  } else if (appName.includes('admin')) {
    port = parseInt(process.env.ADMIN_PORT || process.env.PORT || '3003', 10);
  } else {
    port = parseInt(process.env.PORT || '5001', 10);
  }

  return {
    name: process.env.APP_NAME || 'NestJS App',
    port,
    env: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || 'api',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
  };
});
