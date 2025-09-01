// Search configuration constants

// Fuse.js search configuration
export const FUSE_OPTIONS = {
  keys: [
    { name: 'key', weight: 0.4 },
    { name: 'summary', weight: 0.3 },
    { name: 'assignee.displayName', weight: 0.15 },
    { name: 'status.name', weight: 0.1 },
    { name: 'issueType.name', weight: 0.08 },
    { name: 'priority.name', weight: 0.07 },
    { name: 'projectKey', weight: 0.05 }
  ],
  threshold: 0.4,
  distance: 100,
  includeScore: true,
  findAllMatches: true,
  minMatchCharLength: 1
}

// Search limits and thresholds
export const SEARCH_LIMITS = {
  maxQueryLength: 200,
  maxResultsBeforeScoring: 50,
  finalResultLimit: 25,
  recentTicketsLimit: 12,
  fallbackResultLimit: 10
} as const

// Scoring weights and bonuses
export const SCORING_WEIGHTS = {
  contextScoreMultiplier: 0.6,
  exactMatchBonus: 75,
  partialMatchBonus: 35,
  maxSummaryMatchBonus: 20,
  summaryPositionDivisor: 5,
  minSummaryMatchBonus: 5
} as const
