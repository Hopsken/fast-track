/**
 * Loading spinner component with various sizes and styles
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'gray' | 'blue' | 'white'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'gray', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    gray: 'border-gray-300 border-t-gray-600',
    blue: 'border-blue-300 border-t-blue-600',
    white: 'border-white/30 border-t-white'
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        border-2 rounded-full animate-spin
        ${className}
      `}
    />
  )
}

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'gray' | 'blue' | 'white'
  className?: string
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  color = 'gray',
  className = '' 
}: LoadingStateProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LoadingSpinner size={size} color={color} />
      {message && (
        <span className={`text-sm ${
          color === 'white' ? 'text-white' : 'text-gray-600'
        }`}>
          {message}
        </span>
      )}
    </div>
  )
}