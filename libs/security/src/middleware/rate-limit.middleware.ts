import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { normalRateLimit } from './rate-limit-config';

/**
 * Rate Limiting Middleware (Default - Normal)
 * 
 * Protects APIs from abuse by limiting the number of requests
 * from a single IP address within a time window.
 * 
 * Uses "normal" rate limit configuration by default.
 * For custom rate limits, use rate-limit-config.ts directly.
 * 
 * Production-ready with configurable options.
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    normalRateLimit(req, res, next);
  }
}

