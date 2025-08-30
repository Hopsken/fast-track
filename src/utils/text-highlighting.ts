import { ReactNode, ReactElement, createElement } from 'react'

export interface HighlightedTextProps {
  text: string
  searchQuery: string
  className?: string
}

/**
 * Highlights matching text within a string
 */
export function highlightText(text: string, searchQuery: string): ReactNode[] {
  // Handle edge cases
  if (!text || typeof text !== 'string') {
    return [text || '']
  }

  if (!searchQuery || typeof searchQuery !== 'string' || !searchQuery.trim()) {
    return [text]
  }

  const query = searchQuery.trim().toLowerCase()
  const lowerText = text.toLowerCase()

  // Avoid infinite loops with empty query after trimming
  if (!query) {
    return [text]
  }

  const parts: ReactNode[] = []
  let lastIndex = 0
  let index = lowerText.indexOf(query)
  let keyCounter = 0

  // Safety limit to prevent infinite loops
  const maxMatches = 100
  let matchCount = 0

  while (index !== -1 && matchCount < maxMatches) {
    // Add text before the match
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index))
    }

    // Add highlighted match
    parts.push(
      createElement(
        'mark',
        {
          key: keyCounter++,
          className:
            'bg-yellow-200 text-yellow-900 px-0.5 rounded-sm font-medium'
        },
        text.slice(index, index + query.length)
      )
    )

    lastIndex = index + query.length
    index = lowerText.indexOf(query, lastIndex)
    matchCount++
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

/**
 * React component for highlighted text
 */
export function HighlightedText({
  text,
  searchQuery,
  className = ''
}: HighlightedTextProps): ReactElement {
  try {
    const highlightedParts = highlightText(text || '', searchQuery || '')
    return createElement('span', { className }, ...highlightedParts)
  } catch (error) {
    console.warn('Error highlighting text:', error)
    // Fallback to plain text if highlighting fails
    return createElement('span', { className }, text || '')
  }
}
