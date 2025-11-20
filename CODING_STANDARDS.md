# Coding Standards & Best Practices

## Overview

This document outlines the coding standards and best practices for the Fast Track project. These guidelines ensure code quality, maintainability, and consistency across the codebase.

## SOLID Principles

### Single Responsibility Principle (SRP)

- Each class/function should have one reason to change
- Keep hooks focused on a single concern (storage, API calls, UI state)
- Separate business logic from UI components

**Example:**

```typescript
// Good: Focused hook for API configuration
const useJiraApiConfig = () => {
  const [config, setConfig] = useState<JiraApiConfig | null>(null)
  // Only handles API configuration logic
}

// Good: Separate hook for storage operations
const useStorageValue = <T>(key: string) => {
  // Only handles storage operations
}
```

### Open-Closed Principle (OCP)

- Open for extension, closed for modification
- Use composition and dependency injection
- Create extensible hook patterns for new storage types

**Example:**

```typescript
// Extensible storage interface
interface StorageAdapter<T> {
  get(key: string): Promise<T | null>
  set(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
}

// Can be extended without modifying existing code
class ChromeStorageAdapter implements StorageAdapter<any> {
  // Implementation
}
```

### Liskov Substitution Principle (LSP)

- Derived classes must be substitutable for base classes
- Ensure storage implementations can be swapped without breaking code

### Interface Segregation Principle (ISP)

- Clients shouldn't depend on unused interfaces
- Create focused TypeScript interfaces for specific use cases

**Example:**

```typescript
// Good: Focused interfaces
interface Searchable {
  search(query: string): Promise<SearchResult[]>
}

interface Cacheable {
  cache(key: string, data: any): void
  getCached(key: string): any
}

// Bad: Monolithic interface
interface SearchService {
  search(query: string): Promise<SearchResult[]>
  cache(key: string, data: any): void
  getCached(key: string): any
  authenticate(): void
  logout(): void
  // ... many other unrelated methods
}
```

### Dependency Inversion Principle (DIP)

- Depend on abstractions, not concretions
- Use generic types and interfaces rather than concrete implementations

## Core Design Principles

### DRY (Don't Repeat Yourself)

- Eliminate code duplication
- Create reusable hooks for common storage patterns
- Extract common logic into utility functions
- Use TypeScript generics to avoid repetitive type definitions

**Example:**

```typescript
// Good: Generic storage hook
const useStorageValue = <T>(key: string, defaultValue: T) => {
  // Reusable for any storage type
}

// Usage
const useJiraConfig = () => useStorageValue('jiraConfig', null)
const useTheme = () => useStorageValue('theme', 'light')
```

### KISS (Keep It Simple, Stupid)

- Favor simplicity over complexity
- Write clear, readable code over clever solutions
- Break complex functions into smaller, focused ones
- Use descriptive names that explain intent

### YAGNI (You Aren't Gonna Need It)

- Don't over-engineer
- Implement features when needed, not in anticipation
- Avoid premature abstractions and generalizations
- Start simple and refactor when complexity is warranted

## Clean Code Guidelines

### Naming Conventions

**Variables and Functions:**

```typescript
// Good: Descriptive, searchable names
const useJiraApiConfig = () => {
  /* */
}
const getStorageValue = (key: string) => {
  /* */
}
const updateTicketData = (ticket: JiraTicket) => {
  /* */
}

// Bad: Abbreviated, unclear names
const useConfig = () => {
  /* */
}
const getVal = (k: string) => {
  /* */
}
const updTkt = (t: any) => {
  /* */
}
```

**Boolean Variables:**

```typescript
// Good: Clear boolean intent
const isEnabled = true
const hasPermission = false
const shouldUpdate = checkCondition()
const canAccess = user.hasRole('admin')

// Bad: Unclear boolean intent
const enabled = true
const permission = false
const update = checkCondition()
```

**Constants:**

```typescript
// Good: Descriptive constants
const MAX_SEARCH_RESULTS = 50
const DEFAULT_DEBOUNCE_DELAY = 300
const JIRA_API_ENDPOINTS = {
  SEARCH: '/search',
  ISSUES: '/issues'
} as const
```

### Function Design

**Keep Functions Small:**

```typescript
// Good: Small, focused function (< 20 lines)
const validateJiraConfig = (config: JiraApiConfig): boolean => {
  if (!config.baseUrl) return false
  if (!config.email) return false
  if (!config.apiToken) return false
  return true
}

// Good: Single level of abstraction
const processSearchResults = (results: JiraTicket[]) => {
  const filtered = filterValidTickets(results)
  const sorted = sortByRelevance(filtered)
  return limitResults(sorted, MAX_SEARCH_RESULTS)
}
```

**Minimize Parameters:**

```typescript
// Good: Use objects for multiple parameters
interface SearchOptions {
  query: string
  limit?: number
  sortBy?: 'relevance' | 'date'
  includeArchived?: boolean
}

const searchTickets = (options: SearchOptions) => {
  // Implementation
}

// Bad: Too many parameters
const searchTickets = (
  query: string,
  limit: number,
  sortBy: string,
  includeArchived: boolean,
  filterBy: string,
  userId: string
) => {
  // Hard to use and maintain
}
```

**Prefer Early Returns:**

```typescript
// Good: Early returns reduce nesting
const processTicket = (ticket: JiraTicket | null) => {
  if (!ticket) return null
  if (!ticket.key) return null
  if (ticket.status === 'archived') return null

  return {
    id: ticket.key,
    title: ticket.summary,
    status: ticket.status
  }
}

// Bad: Nested conditions
const processTicket = (ticket: JiraTicket | null) => {
  if (ticket) {
    if (ticket.key) {
      if (ticket.status !== 'archived') {
        return {
          id: ticket.key,
          title: ticket.summary,
          status: ticket.status
        }
      }
    }
  }
  return null
}
```

### Comments and Documentation

**Write Self-Documenting Code:**

```typescript
// Good: Code explains itself
const isValidJiraTicketKey = (key: string): boolean => {
  const jiraKeyPattern = /^[A-Z]+-\d+$/
  return jiraKeyPattern.test(key)
}

// Bad: Needs comments to understand
const validate = (k: string): boolean => {
  // Check if k matches Jira ticket key format
  const p = /^[A-Z]+-\d+$/
  return p.test(k)
}
```

**Use Comments for "Why", Not "What":**

```typescript
// Good: Explains business logic
const debounceDelay = 300 // Prevent excessive API calls while user is typing

// Bad: States the obvious
const debounceDelay = 300 // Set debounce delay to 300ms
```

**JSDoc for Public APIs:**

```typescript
/**
 * Searches for Jira tickets based on the provided query.
 *
 * @param query - The search query string
 * @param options - Optional search configuration
 * @returns Promise resolving to an array of matching tickets
 * @throws {JiraApiError} When API request fails
 */
export const searchTickets = async (
  query: string,
  options?: SearchOptions
): Promise<JiraTicket[]> => {
  // Implementation
}
```

### Logging Practices

**Avoid Console Logs:**

```typescript
// Bad: Console logs in production code
const searchTickets = async (query: string) => {
  console.log('Searching for:', query) // Remove before commit
  const results = await api.search(query)
  console.log('Results:', results) // Remove before commit
  return results
}

// Good: Use proper logging when needed
const searchTickets = async (query: string) => {
  logger.debug('Performing ticket search', { query })
  const results = await api.search(query)
  logger.debug('Search completed', { resultCount: results.length })
  return results
}
```

### Error Handling Practices

**Let Meaningful Errors Bubble Up:**

```typescript
// Good: Let specific errors bubble up
const fetchTicket = async (id: string): Promise<JiraTicket> => {
  const response = await fetch(`/api/tickets/${id}`)

  if (!response.ok) {
    throw new JiraApiError(`Failed to fetch ticket ${id}`, response.status)
  }

  return response.json()
}

// Bad: Swallowing errors
const fetchTicket = async (id: string): Promise<JiraTicket | null> => {
  try {
    const response = await fetch(`/api/tickets/${id}`)
    return response.json()
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return null // Lost important error information
  }
}
```

**Use Specific Error Handling:**

```typescript
// Good: Handle specific error cases
const authenticateUser = async (credentials: Credentials) => {
  try {
    return await jiraClient.authenticate(credentials)
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw new UserFriendlyError(
        'Invalid credentials. Please check your email and API token.'
      )
    }
    if (error instanceof NetworkError) {
      throw new UserFriendlyError(
        'Unable to connect to Jira. Please check your internet connection.'
      )
    }
    throw error // Re-throw unexpected errors
  }
}
```

## TypeScript Best Practices

### Type Safety

**Use Strict Configuration:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Avoid `any` Type:**

```typescript
// Good: Specific types
interface JiraTicket {
  key: string
  summary: string
  status: 'open' | 'in-progress' | 'done'
  assignee?: User
}

// Bad: Using any
interface JiraTicket {
  key: string
  summary: string
  status: any
  assignee: any
}
```

**Use Type Assertions Sparingly:**

```typescript
// Good: Type guards
const isJiraTicket = (obj: unknown): obj is JiraTicket => {
  return (
    typeof obj === 'object' && obj !== null && 'key' in obj && 'summary' in obj
  )
}

// Bad: Unsafe type assertion
const ticket = response.data as JiraTicket // Could be wrong
```

### Generic Usage

**Use Generics for Reusability:**

```typescript
// Good: Generic storage hook
const useStorageValue = <T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] => {
  // Implementation
}

// Good: Constrained generics
interface StorageKey {
  jiraConfig: JiraApiConfig
  theme: 'light' | 'dark'
  searchHistory: string[]
}

const useTypedStorage = <K extends keyof StorageKey>(
  key: K
): [StorageKey[K] | null, (value: StorageKey[K]) => void] => {
  // Type-safe storage access
}
```

### Interface Design

**Keep Interfaces Focused:**

```typescript
// Good: Focused interfaces
interface SearchableTicket {
  key: string
  summary: string
  description?: string
}

interface DisplayableTicket {
  key: string
  summary: string
  status: TicketStatus
  assignee?: User
}

// Use composition when needed
type FullTicket = SearchableTicket &
  DisplayableTicket & {
    created: Date
    updated: Date
  }
```

## React/Hook Best Practices

### Hook Design

**Follow Naming Convention:**

```typescript
// Good: Clear hook names
const useJiraTicketSearch = (query: string) => {
  /* */
}
const useStorageValue = <T>(key: string, defaultValue: T) => {
  /* */
}
const useDebounced = <T>(value: T, delay: number) => {
  /* */
}
```

**Keep Hooks Focused:**

```typescript
// Good: Single responsibility
const useJiraAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const login = useCallback(async (credentials: Credentials) => {
    // Only handles authentication logic
  }, [])

  return { isAuthenticated, user, login }
}

// Good: Separate hook for API calls
const useJiraApi = () => {
  const searchTickets = useCallback(async (query: string) => {
    // Only handles API calls
  }, [])

  return { searchTickets }
}
```

**Return Consistent Data Structures:**

```typescript
// Good: Consistent return pattern
const useAsyncOperation = <T>(operation: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Implementation

  return { data, loading, error, execute }
}
```

### State Management

**Prefer Local State:**

```typescript
// Good: Local state for component-specific data
const SearchInput = () => {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Component-specific state stays local
}

// Good: Global state for shared data
const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query })
}))
```

**Use Proper Dependency Arrays:**

```typescript
// Good: Correct dependencies
const useTicketSearch = (query: string) => {
  const [results, setResults] = useState<JiraTicket[]>([])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const searchTickets = async () => {
      const tickets = await api.search(query)
      setResults(tickets)
    }

    searchTickets()
  }, [query]) // Correct dependency

  return results
}
```

## WXT Extension Best Practices

### Storage Patterns

**Type-Safe Storage:**

```typescript
// Good: Type-safe storage keys
interface StorageSchema {
  jiraConfig: JiraApiConfig
  theme: 'light' | 'dark'
  searchHistory: string[]
  lastSync: number
}

const storage = {
  async get<K extends keyof StorageSchema>(
    key: K
  ): Promise<StorageSchema[K] | null> {
    const result = await browser.storage.local.get(key)
    return result[key] ?? null
  },

  async set<K extends keyof StorageSchema>(
    key: K,
    value: StorageSchema[K]
  ): Promise<void> {
    await browser.storage.local.set({ [key]: value })
  }
}
```

**Error Handling for Storage:**

```typescript
// Good: Proper error handling
const useStorageValue = <K extends keyof StorageSchema>(
  key: K,
  defaultValue: StorageSchema[K]
) => {
  const [value, setValue] = useState<StorageSchema[K]>(defaultValue)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await storage.get(key)
        if (stored !== null) {
          setValue(stored)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Storage error'))
      }
    }

    loadValue()
  }, [key])

  const updateValue = useCallback(
    async (newValue: StorageSchema[K]) => {
      try {
        await storage.set(key, newValue)
        setValue(newValue)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Storage error'))
      }
    },
    [key]
  )

  return { value, updateValue, error }
}
```

### Content Script Organization

**Keep Content Scripts Lightweight:**

```typescript
// Good: Lightweight content script
const initializeTicketHighlighting = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        highlightNewTickets(mutation.addedNodes)
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect()
  })
}

// Initialize only when needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTicketHighlighting)
} else {
  initializeTicketHighlighting()
}
```

### Background Script Design

**Keep Background Scripts Stateless:**

```typescript
// Good: Stateless background script
class BackgroundService {
  private database: Database | null = null

  async initialize() {
    this.database = await initializeDatabase()
    this.registerMessageHandlers()
  }

  private registerMessageHandlers() {
    browser.runtime.onMessage.addListener(async (message, sender) => {
      switch (message.type) {
        case 'SEARCH_TICKETS':
          return this.handleTicketSearch(message.query)
        case 'GET_CONFIG':
          return this.handleGetConfig()
        default:
          throw new Error(`Unknown message type: ${message.type}`)
      }
    })
  }

  private async handleTicketSearch(query: string) {
    if (!this.database) {
      throw new Error('Database not initialized')
    }
    return this.database.searchTickets(query)
  }
}
```

## Code Organization

### File Structure

**Group Related Functionality:**

```
src/
├── components/          # React components
│   ├── search/         # Search-related components
│   ├── tickets/        # Ticket-related components
│   └── common/         # Shared components
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── utils/              # Pure utility functions
├── types/              # TypeScript type definitions
└── storage/            # Storage-related code
```

**Use Index Files for Clean Imports:**

```typescript
// components/index.ts
export { SearchInput } from './search/SearchInput'
export { TicketCard } from './tickets/TicketCard'
export { Button } from './common/Button'

// Usage
import { SearchInput, TicketCard, Button } from '@/components'
```

### Import/Export Patterns

**Use Named Exports:**

```typescript
// Good: Named exports
export const useJiraAuth = () => {
  /* */
}
export const useTicketSearch = () => {
  /* */
}

// Good: Grouped imports
import { useJiraAuth, useTicketSearch } from '@/hooks'
import { SearchInput, TicketCard } from '@/components'
import type { JiraTicket, User } from '@/types'
```

**Group Imports by Type:**

```typescript
// External libraries
import React, { useState, useEffect, useCallback } from 'react'
import { create } from 'zustand'

// Internal modules
import { useJiraAuth } from '@/hooks'
import { SearchInput } from '@/components'
import { searchTickets } from '@/services'

// Type imports
import type { JiraTicket, SearchOptions } from '@/types'
```

## Testing Best Practices

### Unit Testing

**Test Business Logic:**

```typescript
// Good: Test pure functions
describe('validateJiraConfig', () => {
  it('should return false for missing baseUrl', () => {
    const config = { email: 'test@example.com', apiToken: 'token' }
    expect(validateJiraConfig(config)).toBe(false)
  })

  it('should return true for valid config', () => {
    const config = {
      baseUrl: 'https://company.atlassian.net',
      email: 'test@example.com',
      apiToken: 'token'
    }
    expect(validateJiraConfig(config)).toBe(true)
  })
})
```

**Test Hook Behavior:**

```typescript
// Good: Test custom hooks
import { renderHook, act } from '@testing-library/react'
import { useTicketSearch } from '@/hooks'

describe('useTicketSearch', () => {
  it('should return empty results for empty query', () => {
    const { result } = renderHook(() => useTicketSearch(''))
    expect(result.current.results).toEqual([])
  })

  it('should update results when query changes', async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useTicketSearch(query),
      { initialProps: { query: '' } }
    )

    rerender({ query: 'PROJ-123' })

    await act(async () => {
      // Wait for async operations
    })

    expect(result.current.results.length).toBeGreaterThan(0)
  })
})
```

## Performance Best Practices

### React Optimization

**Use Proper Memoization:**

```typescript
// Good: Memoize expensive calculations
const SearchResults = ({ tickets, query }: Props) => {
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket =>
      ticket.summary.toLowerCase().includes(query.toLowerCase())
    )
  }, [tickets, query])

  return (
    <div>
      {filteredTickets.map(ticket => (
        <TicketCard key={ticket.key} ticket={ticket} />
      ))}
    </div>
  )
}

// Good: Memoize callbacks
const SearchInput = ({ onSearch }: Props) => {
  const [query, setQuery] = useState('')

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }, [query, onSearch])

  return (
    <form onSubmit={handleSubmit}>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
    </form>
  )
}
```

### Debouncing and Throttling

**Debounce User Input:**

```typescript
// Good: Debounced search
const useDebounced = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Usage
const SearchComponent = () => {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounced(query, 300)

  useEffect(() => {
    if (debouncedQuery) {
      searchTickets(debouncedQuery)
    }
  }, [debouncedQuery])

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search tickets..."
    />
  )
}
```

These coding standards ensure maintainable, performant, and reliable code across the Fast Track project. Regular code reviews should enforce these practices and identify areas for improvement.
