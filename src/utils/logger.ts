/**
 * Simple logging utility that respects development mode
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, ...args: unknown[]): void {
    if (!this.isDevelopment && level === 'debug') {
      return
    }

    switch (level) {
      case 'debug':
        console.log(...args)
        break
      case 'info':
        console.info(...args)
        break
      case 'warn':
        console.warn(...args)
        break
      case 'error':
        console.error(...args)
        break
    }
  }

  debug(...args: unknown[]): void {
    this.log('debug', ...args)
  }

  info(...args: unknown[]): void {
    this.log('info', ...args)
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args)
  }

  error(...args: unknown[]): void {
    this.log('error', ...args)
  }

  /**
   * Creates a namespaced logger for better organization
   */
  namespace(name: string): Logger {
    const namespacedLogger = new Logger()

    namespacedLogger.debug = (...args: unknown[]) =>
      this.debug(`[${name}]`, ...args)
    namespacedLogger.info = (...args: unknown[]) =>
      this.info(`[${name}]`, ...args)
    namespacedLogger.warn = (...args: unknown[]) =>
      this.warn(`[${name}]`, ...args)
    namespacedLogger.error = (...args: unknown[]) =>
      this.error(`[${name}]`, ...args)

    return namespacedLogger
  }
}

// Export a default logger instance
export const logger = new Logger()

// Export the Logger class for creating namespaced loggers
export { Logger }
