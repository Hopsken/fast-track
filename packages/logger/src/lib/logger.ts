export interface Logger {
  log(...args: unknown[]): void
  error(...args: unknown[]): void
}

export class ConsoleLogger implements Logger {
  log(...args: unknown[]): void {
    console.log(...args)
  }

  error(...args: unknown[]): void {
    console.error(...args)
  }
}

export class LoggerFactory {
  private static instance: Logger

  public static getInstance(): Logger {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = new ConsoleLogger()
    }
    return LoggerFactory.instance
  }
}
