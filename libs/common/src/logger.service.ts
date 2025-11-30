import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

/**
 * Enhanced Logger Service
 * Provides structured logging with context
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    console.log(`[${ctx}] ${message}`);
  }

  error(message: any, trace?: string, context?: string) {
    const ctx = context || this.context || 'Application';
    console.error(`[${ctx}] ${message}`, trace ? `\n${trace}` : '');
  }

  warn(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    console.warn(`[${ctx}] ${message}`);
  }

  debug(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${ctx}] ${message}`);
    }
  }

  verbose(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${ctx}] [VERBOSE] ${message}`);
    }
  }
}

