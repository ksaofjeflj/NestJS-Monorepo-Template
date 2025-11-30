import { Request } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Rate Limit Configurations
 * 
 * Pre-configured rate limiters for different use cases:
 * - strict: Very strict (e.g., auth endpoints)
 * - normal: Standard (e.g., API endpoints)
 * - lenient: More permissive (e.g., public endpoints)
 * - custom: Create your own configuration
 */

/**
 * Strict Rate Limiter
 * Use for sensitive endpoints like login, register, password reset
 */
export const strictRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_STRICT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_STRICT_MAX || '5', 10), // 5 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_STRICT_WINDOW_MS || '900000', 10) / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip);
  },
});

/**
 * Normal Rate Limiter
 * Use for standard API endpoints
 */
export const normalRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10) / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip);
  },
});

/**
 * Lenient Rate Limiter
 * Use for public endpoints that can handle more traffic
 */
export const lenientRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_LENIENT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_LENIENT_MAX || '1000', 10), // 1000 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_LENIENT_WINDOW_MS || '900000', 10) / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip);
  },
});

/**
 * Create Custom Rate Limiter
 * 
 * @param windowMs Time window in milliseconds
 * @param max Maximum requests per window
 * @param message Custom error message
 */
export function createRateLimit(
  windowMs: number,
  max: number,
  message?: string,
) {
  return rateLimit({
    windowMs,
    max,
    message: message || {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
      return trustedIPs.includes(req.ip);
    },
  });
}

