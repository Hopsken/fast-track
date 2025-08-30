import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary"
import { HiExclamationCircle, HiRefresh } from "react-icons/hi"
import { ErrorInfo } from "react"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center mb-3">
        <HiExclamationCircle className="w-6 h-6 text-red-500 mr-2" />
        <h2 className="text-lg font-semibold text-red-700">
          Something went wrong
        </h2>
      </div>

      <p className="text-sm text-red-600 text-center mb-4 max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>

      <button
        onClick={resetErrorBoundary}
        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200">
        <HiRefresh className="w-4 h-4 mr-2" />
        Try again
      </button>

      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 w-full">
          <summary className="cursor-pointer text-sm text-red-600 font-medium">
            Error details (development)
          </summary>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-32">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export function ErrorBoundary({
  children,
  fallback = ErrorFallback,
  onError
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error for debugging
    console.error("🚨 Error Boundary caught error:", error)
    console.error("🚨 Component stack:", errorInfo.componentStack)

    // Call custom error handler if provided
    onError?.(error, errorInfo)
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={() => {
        // Optional: Reset any global state or clear storage
        console.log("🔄 Error boundary reset")
      }}>
      {children}
    </ReactErrorBoundary>
  )
}
