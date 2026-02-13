type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, metadata, error } = entry;
    const parts = [
      `[${timestamp}]`,
      `[${level.toUpperCase()}]`,
      message,
    ];

    if (metadata && Object.keys(metadata).length > 0) {
      parts.push(JSON.stringify(metadata));
    }

    if (error) {
      parts.push(`\nError: ${error.message}`);
      if (this.isDevelopment && error.stack) {
        parts.push(`\nStack: ${error.stack}`);
      }
    }

    return parts.join(' ');
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      error,
    };

    const formatted = this.formatLog(entry);

    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
      default:
        console.log(formatted);
    }

    // In production, you might want to send logs to a service like:
    // - Sentry for errors
    // - LogRocket for session replay
    // - CloudWatch, Datadog, etc.
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log('error', message, metadata, error);
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata);
  }
}

export const logger = new Logger();

