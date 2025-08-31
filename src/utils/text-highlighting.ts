import { ReactNode, ReactElement, createElement } from 'react'

export interface HighlightedTextProps {
  text: string
  searchQuery: string
  className?: string
}

/**
 * Escape special regex characters in search query
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Enhanced highlighting with better performance and multi-term support
 */
export function highlightText(text: string, searchQuery: string): ReactNode[] {
  // Handle edge cases
  if (!text || typeof text !== 'string') {
    return [text || '']
  }

  if (!searchQuery || typeof searchQuery !== 'string' || !searchQuery.trim()) {
    return [text]
  }

  const trimmedQuery = searchQuery.trim()

  // Avoid infinite loops with empty query after trimming
  if (!trimmedQuery) {
    return [text]
  }

  try {
    // Split query into individual terms for better matching
    const terms = trimmedQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0)

    if (terms.length === 0) {
      return [text]
    }

    // Create regex pattern for all terms
    const escapedTerms = terms.map(escapeRegExp)
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi')

    const parts: ReactNode[] = []
    const matches = text.split(regex)
    let keyCounter = 0

    matches.forEach((part) => {
      if (!part) return

      const isMatch = terms.some(
        (term) =>
          part.toLowerCase() === term ||
          new RegExp(`^${escapeRegExp(term)}$`, 'i').test(part)
      )

      if (isMatch) {
        parts.push(
          createElement(
            'mark',
            {
              key: keyCounter++,
              className:
                'bg-yellow-200 text-yellow-900 px-0.5 rounded font-medium'
            },
            part
          )
        )
      } else {
        parts.push(part)
      }
    })

    return parts.length > 0 ? parts : [text]
  } catch (error) {
    console.warn('Error in highlightText:', error)
    return [text]
  }
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
