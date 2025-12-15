import { SetMetadata } from '@nestjs/common';

/**
 * Public Decorator
 * 
 * Marks a route as public (no authentication required).
 * 
 * @example
 * ```typescript
 * @Public()
 * @Get('public')
 * getPublicData() { ... }
 * ```
 */
export const Public = () => SetMetadata('isPublic', true);

