import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Request Logging Middleware
 * 
 * Logs all incoming HTTP requests with:
 * - Method, URL, IP address
 * - Response status and time
 * - User agent
 * 
 * Production-ready with configurable log levels.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Log response when finished
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const contentLength = res.get('content-length') || 0;

      if (statusCode >= 500) {
        this.logger.error(
          `${method} ${originalUrl} ${statusCode} ${duration}ms ${contentLength} - ${ip}`,
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `${method} ${originalUrl} ${statusCode} ${duration}ms ${contentLength} - ${ip}`,
        );
      } else {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} ${duration}ms ${contentLength} - ${ip}`,
        );
      }
    });

    next();
  }
}

