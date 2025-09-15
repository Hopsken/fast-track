import type { JiraTicket } from '@/lib/storage'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface SearchCacheEntry {
  query: string
  results: JiraTicket[]
  timestamp: number
}

interface ScoreCacheEntry {
  ticketKey: string
  score: number
  timestamp: number
  contextHash: string
}

/**
 * Generic cache implementation with TTL support
 */
class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly defaultTTL: number

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.defaultTTL = defaultTTL
  }

  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL
    }
    this.cache.set(key, entry)
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return undefined
    }

    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  clear(): void {
    this.cache.clear()
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  size(): number {
    this.cleanup()
    return this.cache.size
  }
}

/**
 * Search results cache with query-based storage
 */
export class SearchCache {
  private cache = new TTLCache<SearchCacheEntry>(2 * 60 * 1000) // 2 minutes TTL
  private readonly maxEntries = 50

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim()
  }

  set(query: string, results: JiraTicket[]): void {
    if (this.cache.size() >= this.maxEntries) {
      this.cache.cleanup()
    }

    const normalizedQuery = this.normalizeQuery(query)
    this.cache.set(normalizedQuery, {
      query,
      results: [...results], // Clone to avoid mutations
      timestamp: Date.now()
    })
  }

  get(query: string): JiraTicket[] | undefined {
    const normalizedQuery = this.normalizeQuery(query)
    const entry = this.cache.get(normalizedQuery)
    return entry?.results
  }

  has(query: string): boolean {
    return this.cache.has(this.normalizeQuery(query))
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size(),
      maxEntries: this.maxEntries
    }
  }
}

/**
 * Scoring cache with context-aware invalidation
 */
export class ScoreCache {
  private cache = new TTLCache<ScoreCacheEntry>(10 * 60 * 1000) // 10 minutes TTL
  private readonly maxEntries = 1000

  private createContextHash(context: {
    userEmail: string
    primaryPrefix: string
    viewHistoryLength: number
    searchHistoryLength: number
    ticketsLength: number
  }): string {
    return `${context.userEmail}-${context.primaryPrefix}-${context.viewHistoryLength}-${context.searchHistoryLength}-${context.ticketsLength}`
  }

  set(
    ticketKey: string,
    score: number,
    context: {
      userEmail: string
      primaryPrefix: string
      viewHistoryLength: number
      searchHistoryLength: number
      ticketsLength: number
    }
  ): void {
    if (this.cache.size() >= this.maxEntries) {
      this.cache.cleanup()
    }

    const contextHash = this.createContextHash(context)
    const cacheKey = `${ticketKey}-${contextHash}`

    this.cache.set(cacheKey, {
      ticketKey,
      score,
      timestamp: Date.now(),
      contextHash
    })
  }

  get(
    ticketKey: string,
    context: {
      userEmail: string
      primaryPrefix: string
      viewHistoryLength: number
      searchHistoryLength: number
      ticketsLength: number
    }
  ): number | undefined {
    const contextHash = this.createContextHash(context)
    const cacheKey = `${ticketKey}-${contextHash}`
    const entry = this.cache.get(cacheKey)
    return entry?.score
  }

  invalidateTicket(ticketKey: string): void {
    // Remove all entries for this ticket regardless of context
    for (const [key] of this.cache['cache'].entries()) {
      if (key.startsWith(`${ticketKey}-`)) {
        this.cache['cache'].delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size(),
      maxEntries: this.maxEntries
    }
  }
}

/**
 * Memoization wrapper for expensive functions
 */
export function memoizeWithTTL<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  ttl: number = 5 * 60 * 1000,
  keyGenerator?: (...args: Args) => string
): (...args: Args) => Return {
  const cache = new TTLCache<Return>(ttl)

  return (...args: Args): Return => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    const cached = cache.get(key)
    if (cached !== undefined) {
      return cached
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

// Global cache instances
export const searchCache = new SearchCache()
export const scoreCache = new ScoreCache()

// Cleanup function for manual cache management
export function cleanupCaches() {
  searchCache.clear()
  scoreCache.clear()
}

// For browser extension popup - cleanup happens automatically when popup closes
// No need for intervals since popup DOM is destroyed on close
// TTL-based cleanup in individual cache methods handles expired entries
