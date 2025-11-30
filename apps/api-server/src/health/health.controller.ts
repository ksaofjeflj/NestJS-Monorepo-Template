import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint with database connectivity' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check() {
    const health = await this.healthService.getHealth();
    
    // Return 503 if database is not connected
    const statusCode = health.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    
    return {
      ...health,
      statusCode,
    };
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe - checks if service is running' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe - checks if service is ready to accept traffic' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readiness() {
    const health = await this.healthService.getHealth();
    const statusCode = health.database.status === 'connected' 
      ? HttpStatus.OK 
      : HttpStatus.SERVICE_UNAVAILABLE;
    
    return {
      status: health.database.status === 'connected' ? 'ready' : 'not ready',
      database: health.database.status,
      timestamp: new Date().toISOString(),
      statusCode,
    };
  }
}

