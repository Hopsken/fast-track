import { ErrorInfo, ReactNode, ComponentType } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { HiExclamationCircle, HiRefresh } from 'react-icons/hi'

import { getLogger } from '~/utils/logger'

const log = getLogger('error-boundary')

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="mb-3 flex items-center">
        <HiExclamationCircle className="mr-2 h-6 w-6 text-red-500" />
        <h2 className="text-lg font-semibold text-red-700">
          Something went wrong
        </h2>
      </div>

      <p className="mb-4 max-w-md text-center text-sm text-red-600">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>

      <button
        onClick={resetErrorBoundary}
        className="flex items-center rounded-md bg-red-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-700">
        <HiRefresh className="mr-2 h-4 w-4" />
        Try again
      </button>

      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 w-full">
          <summary className="cursor-pointer text-sm font-medium text-red-600">
            Error details (development)
          </summary>
          <pre className="mt-2 max-h-32 overflow-auto rounded bg-red-100 p-2 text-xs">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export function ErrorBoundary({
  children,
  fallback = ErrorFallback,
  onError
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error for debugging
    log.error('🚨 Error Boundary caught error:', error)
    log.error('🚨 Component stack:', errorInfo.componentStack)

    // Call custom error handler if provided
    onError?.(error, errorInfo)
  }

  return (
    <ReactErrorBoundary FallbackComponent={fallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  )
}
