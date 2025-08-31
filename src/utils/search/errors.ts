// Search-specific error types for better error handling

export class SearchError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = true
  ) {
    super(message)
    this.name = 'SearchError'
  }
}

export class ValidationError extends SearchError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', false)
    this.name = 'ValidationError'
  }
}

export class DataError extends SearchError {
  constructor(message: string) {
    super(message, 'DATA_ERROR', true)
    this.name = 'DataError'
  }
}

export class CacheError extends SearchError {
  constructor(message: string) {
    super(message, 'CACHE_ERROR', true)
    this.name = 'CacheError'
  }
}

export class ScoringError extends SearchError {
  constructor(
    message: string,
    public readonly ticketKey?: string
  ) {
    super(message, 'SCORING_ERROR', true)
    this.name = 'ScoringError'
  }
}

// Error factory functions for consistent error creation
export function createValidationError(
  field: string,
  value: any
): ValidationError {
  return new ValidationError(`Invalid ${field}: ${value}`)
}

export function createDataError(operation: string): DataError {
  return new DataError(`Data operation failed: ${operation}`)
}

export function createScoringError(
  ticketKey: string,
  cause?: string
): ScoringError {
  const message = cause
    ? `Scoring failed for ${ticketKey}: ${cause}`
    : `Scoring failed for ${ticketKey}`
  return new ScoringError(message, ticketKey)
}

// Error handling utilities
export function isRecoverableError(error: Error): boolean {
  if (error instanceof SearchError) {
    return error.recoverable
  }
  return true // Assume unknown errors are recoverable
}

export function getErrorMessage(error: Error): string {
  if (error instanceof SearchError) {
    return error.message
  }
  return 'Search failed unexpectedly'
}

export function shouldRetry(error: Error): boolean {
  if (error instanceof ValidationError) {
    return false // Never retry validation errors
  }
  if (error instanceof SearchError) {
    return error.recoverable
  }
  return true // Retry unknown errors
}
