import { useState } from 'react'

import type { JiraPriority } from '~/storage'

interface PriorityIconProps {
  priority?: JiraPriority
  size?: string
  className?: string
}

export function PriorityIcon({
  priority,
  size = '1rem',
  className = ''
}: PriorityIconProps) {
  const [imageError, setImageError] = useState(false)

  if (!priority) {
    return null
  }

  const handleImageError = () => {
    setImageError(true)
  }

  if (!priority.iconUrl || imageError) {
    // Fallback to text-based priority indicators
    const priorityName = priority.name?.toLowerCase() || ''
    let fallbackColor = 'bg-gray-400'
    let fallbackText = '–'

    if (priorityName.includes('highest') || priorityName.includes('critical')) {
      fallbackColor = 'bg-red-500'
      fallbackText = '!!'
    } else if (priorityName.includes('high')) {
      fallbackColor = 'bg-orange-500'
      fallbackText = '!'
    } else if (priorityName.includes('medium')) {
      fallbackColor = 'bg-yellow-500'
      fallbackText = '='
    } else if (priorityName.includes('low') || priorityName.includes('lowest')) {
      fallbackColor = 'bg-green-500'
      fallbackText = '↓'
    }

    return (
      <div
        className={`inline-flex items-center justify-center rounded text-xs font-bold text-white ${fallbackColor} ${className}`}
        style={{ width: size, height: size }}
        title={priority.name || 'Priority'}
        role="img"
        aria-label={priority.name || 'Priority'}>
        {fallbackText}
      </div>
    )
  }

  return (
    <div role="presentation" className={className}>
      <img
        alt={priority.name || 'Priority'}
        src={priority.iconUrl}
        className="block"
        style={{ width: size, height: size }}
        onError={handleImageError}
        title={priority.name}
      />
    </div>
  )
}