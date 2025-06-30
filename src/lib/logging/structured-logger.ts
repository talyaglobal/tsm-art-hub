interface LogLevel {
  ERROR: "error"
  WARN: "warn"
  INFO: "info"
  DEBUG: "debug"
}

interface LogEntry {
  level: string
  message: string
  timestamp: string
  metadata?: Record<string, any>
  userId?: string
  requestId?: string
  service?: string
}

class StructuredLogger {
  private readonly levels: LogLevel = {
    ERROR: "error",
    WARN: "warn",
    INFO: "info",
    DEBUG: "debug",
  }

  private formatLog(level: string, message: string, metadata?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      service: "tsmarthub-microservices",
    }
  }

  error(message: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLog(this.levels.ERROR, message, metadata)
    console.error(JSON.stringify(logEntry))
  }

  warn(message: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLog(this.levels.WARN, message, metadata)
    console.warn(JSON.stringify(logEntry))
  }

  info(message: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLog(this.levels.INFO, message, metadata)
    console.info(JSON.stringify(logEntry))
  }

  debug(message: string, metadata?: Record<string, any>): void {
    const logEntry = this.formatLog(this.levels.DEBUG, message, metadata)
    console.debug(JSON.stringify(logEntry))
  }

  withContext(context: { userId?: string; requestId?: string }) {
    return {
      error: (message: string, metadata?: Record<string, any>) => {
        this.error(message, { ...metadata, ...context })
      },
      warn: (message: string, metadata?: Record<string, any>) => {
        this.warn(message, { ...metadata, ...context })
      },
      info: (message: string, metadata?: Record<string, any>) => {
        this.info(message, { ...metadata, ...context })
      },
      debug: (message: string, metadata?: Record<string, any>) => {
        this.debug(message, { ...metadata, ...context })
      },
    }
  }
}

export const logger = new StructuredLogger()
