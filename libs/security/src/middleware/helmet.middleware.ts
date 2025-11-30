import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Helmet Security Middleware
 * 
 * Sets various HTTP headers to help protect your app from well-known
 * web vulnerabilities by setting HTTP headers appropriately.
 * 
 * Production-ready security headers:
 * - Content Security Policy
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 */
@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  private helmetMiddleware: ReturnType<typeof helmet>;

  constructor() {
    this.helmetMiddleware = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false, // Can be enabled if needed
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.helmetMiddleware(req, res, next);
  }
}

