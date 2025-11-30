import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

/**
 * Compression Middleware
 * 
 * Compresses response bodies to reduce bandwidth usage.
 * Automatically compresses responses based on content type.
 * 
 * Production-ready with optimal compression settings.
 */
@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private compressor: ReturnType<typeof compression>;

  constructor() {
    this.compressor = compression({
      level: parseInt(process.env.COMPRESSION_LEVEL || '6', 10), // Compression level (1-9)
      threshold: parseInt(process.env.COMPRESSION_THRESHOLD || '1024', 10), // Only compress if response size > 1KB
      filter: (req: Request, res: Response) => {
        // Don't compress if client doesn't support it
        if (req.headers['x-no-compression']) {
          return false;
        }
        // Use compression for all other requests
        return compression.filter(req, res);
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.compressor(req, res, next);
  }
}

