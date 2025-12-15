/**
 * Cache Options Interface
 * 
 * Options for the @Cacheable() decorator
 */
export interface CacheOptions {
  /**
   * Time to live in seconds
   * @default 3600 (1 hour)
   */
  ttl?: number;

  /**
   * Cache key
   * Can be a string or a function that receives method arguments and returns a string
   * @default Auto-generated from class name, method name, and arguments
   */
  key?: string | ((...args: any[]) => string);

  /**
   * Key prefix
   * @default Uses global prefix from cache config
   */
  keyPrefix?: string;
}

