import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

/**
 * Worker Bootstrap
 * 
 * This creates an ApplicationContext (not an HTTP server).
 * The worker runs in the background and executes scheduled tasks.
 * 
 * Key differences from API server:
 * - Uses createApplicationContext() instead of create()
 * - No HTTP server (no port)
 * - Runs scheduled tasks and background jobs
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('Worker');

  logger.log('🚀 Worker service is running...');
  logger.log('📋 Scheduled tasks are active');
  logger.log('💡 This worker has no HTTP server - it only runs background tasks');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.log('⚠️  Received SIGINT, shutting down gracefully...');
    await app.close();
    logger.log('✅ Worker shut down complete');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.log('⚠️  Received SIGTERM, shutting down gracefully...');
    await app.close();
    logger.log('✅ Worker shut down complete');
    process.exit(0);
  });
}

bootstrap();

