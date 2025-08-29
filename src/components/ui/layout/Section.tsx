/**
 * Section component for organizing content in cards/panels
 */

import { ReactNode } from 'react'

interface SectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function Section({ title, description, children, className = '' }: SectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}

interface SectionGroupProps {
  children: ReactNode
  className?: string
}

export function SectionGroup({ children, className = '' }: SectionGroupProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {children}
    </div>
  )
}