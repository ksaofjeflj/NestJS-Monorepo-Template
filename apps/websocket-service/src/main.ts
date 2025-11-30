import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS
  const corsConfig = configService.get('app.cors');
  app.enableCors(corsConfig);

  // Port priority: WEBSOCKET_PORT > PORT > 3001
  const port = parseInt(process.env.WEBSOCKET_PORT || process.env.PORT || '3001', 10);
  await app.listen(port);

  console.log(`🚀 WebSocket service is running on: http://localhost:${port}`);
  console.log(`📡 WebSocket gateway available at: ws://localhost:${port}`);
}

bootstrap();

