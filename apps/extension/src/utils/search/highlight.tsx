import { ReactNode } from 'react'

/**
 * Highlights matching text within a string based on the search query
 */
export function highlightText(text: string, query: string): ReactNode {
  if (!query || !text) {
    return text
  }

  const normalizedQuery = query.toLowerCase().trim()
  const normalizedText = text.toLowerCase()

  if (!normalizedQuery || !normalizedText.includes(normalizedQuery)) {
    return text
  }

  const parts: ReactNode[] = []
  const regex = new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'gi')
  const matches = text.split(regex)

  matches.forEach((part, index) => {
    if (part.toLowerCase() === normalizedQuery) {
      parts.push(
        <mark
          key={index}
          className="rounded bg-yellow-200 px-0.5 font-medium text-yellow-900">
          {part}
        </mark>
      )
    } else if (part) {
      parts.push(part)
    }
  })

  return <span>{parts}</span>
}

/**
 * Escape special regex characters in search query
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Create highlighted version of text with multiple possible search terms
 */
export function highlightMultipleTerms(
  text: string,
  searchTerms: string[]
): ReactNode {
  if (!searchTerms.length || !text) {
    return text
  }

  // Filter out empty terms and create regex pattern
  const validTerms = searchTerms
    .filter((term) => term.trim().length > 0)
    .map((term) => escapeRegExp(term.toLowerCase().trim()))

  if (validTerms.length === 0) {
    return text
  }

  const regex = new RegExp(`(${validTerms.join('|')})`, 'gi')
  const parts: ReactNode[] = []
  const matches = text.split(regex)

  matches.forEach((part, index) => {
    const isMatch = validTerms.some(
      (term) =>
        part.toLowerCase() === term || new RegExp(`^${term}$`, 'i').test(part)
    )

    if (isMatch) {
      parts.push(
        <mark
          key={index}
          className="rounded bg-yellow-200 px-0.5 font-medium text-yellow-900">
          {part}
        </mark>
      )
    } else if (part) {
      parts.push(part)
    }
  })

  return <span>{parts}</span>
}

/**
 * Smart text highlighting that handles partial word matches and multiple terms
 */
export function smartHighlight(text: string, query: string): ReactNode {
  if (!query || !text) {
    return text
  }

  // Split query into individual terms
  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0)

  if (terms.length === 0) {
    return text
  }

  // For single terms, use simple highlighting
  if (terms.length === 1) {
    return highlightText(text, terms[0])
  }

  // For multiple terms, highlight each one
  return highlightMultipleTerms(text, terms)
}
