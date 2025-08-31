import type {
  JiraTicket,
  TicketViewRecord,
  JiraStatus,
  JiraPriority,
  JiraAssignee
} from '~/storage'

import { memoizeWithTTL } from './cache'

export interface ScoringContext {
  now: number
  isSearchMode: boolean
  viewHistory: TicketViewRecord[]
  userEmail: string
  primaryPrefix: string
  tickets: JiraTicket[]
}

export interface TimeContext {
  isWorkingHours: boolean
  isWeekday: boolean
  isMonday: boolean
  isFriday: boolean
  hour: number
  dayOfWeek: number
}

/**
 * Calculate context-aware score for a ticket based on various factors
 */
function _calculateContextScore(
  ticket: JiraTicket,
  context: ScoringContext
): number {
  let score = 0
  const lastViewedTime = new Date(ticket.lastViewed).getTime()
  const daysSinceViewed = (context.now - lastViewedTime) / (1000 * 60 * 60 * 24)

  const timeContext = getTimeContext()

  // 1. RECENCY SCORE - More sophisticated time decay
  score += calculateRecencyScore(daysSinceViewed)

  // 2. FREQUENCY AND ENGAGEMENT SCORE
  score += calculateFrequencyScore(ticket.key, context.viewHistory)

  // 3. ASSIGNEE RELEVANCE - Prioritize user's own tickets
  score += calculateAssigneeScore(
    ticket.assignee,
    context.userEmail,
    timeContext
  )

  // 4. STATUS-BASED CONTEXTUAL PRIORITY
  score += calculateStatusScore(ticket.status, timeContext)

  // 5. PRIORITY-BASED SCORING
  score += calculatePriorityScore(ticket.priority)

  // 6. PROJECT CONTEXT AND MOMENTUM
  score += calculateProjectScore({
    ticket,
    primaryPrefix: context.primaryPrefix,
    tickets: context.tickets,
    now: context.now
  })

  // 7. TIME-SENSITIVE PATTERNS
  score += calculateTimePatternScore(ticket.status, timeContext)

  return Math.max(score, 0) // Ensure non-negative scores
}

function getTimeContext(): TimeContext {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()

  return {
    isWorkingHours: hour >= 9 && hour <= 17,
    isWeekday: dayOfWeek >= 1 && dayOfWeek <= 5,
    isMonday: dayOfWeek === 1,
    isFriday: dayOfWeek === 5,
    hour,
    dayOfWeek
  }
}

function calculateRecencyScore(daysSinceViewed: number): number {
  if (daysSinceViewed < 0.5) {
    return 60 // Very recent (last 12 hours)
  } else if (daysSinceViewed < 1) {
    return 45 // Today
  } else if (daysSinceViewed < 2) {
    return 35 // Yesterday
  } else if (daysSinceViewed < 7) {
    return Math.max(25 - daysSinceViewed * 3, 10) // Last week (exponential decay)
  } else if (daysSinceViewed < 30) {
    return Math.max(15 - daysSinceViewed, 5) // Last month
  }
  return 0
}

function calculateFrequencyScore(
  ticketKey: string,
  viewHistory: TicketViewRecord[]
): number {
  const viewRecord = viewHistory.find((v) => v.ticketKey === ticketKey)
  if (!viewRecord) return 0

  // Logarithmic scaling for view count to prevent outliers
  let score = Math.min(Math.log2(viewRecord.viewCount + 1) * 8, 40)

  // Consistency bonus - frequently viewed tickets over time
  if (viewRecord.viewCount > 5) {
    score += 10
  }

  return score
}

function calculateAssigneeScore(
  assignee: JiraAssignee | undefined,
  userEmail: string,
  timeContext: TimeContext
): number {
  if (!assignee || !userEmail) return 0

  const assigneeEmail = (
    assignee.emailAddress ||
    assignee.displayName ||
    ''
  ).toLowerCase()
  const currentUserEmail = userEmail.toLowerCase()

  if (
    assigneeEmail === currentUserEmail ||
    assigneeEmail.includes(currentUserEmail.split('@')[0]) ||
    (assignee.displayName &&
      assignee.displayName
        .toLowerCase()
        .includes(currentUserEmail.split('@')[0]))
  ) {
    let score = 25 // Own tickets get high priority

    // Extra boost during working hours for own tickets
    if (timeContext.isWorkingHours && timeContext.isWeekday) {
      score += 10
    }

    return score
  }

  return 0
}

function calculateStatusScore(
  status: JiraStatus,
  timeContext: TimeContext
): number {
  const statusLower = (status?.name || '').toLowerCase()
  const statusCategory = status?.statusCategory?.name?.toLowerCase() || ''

  // Use Jira's native status categories first
  if (statusCategory === 'in_progress') {
    let score = 20 // Active work gets highest priority

    // Extra boost on weekdays for active tickets
    if (timeContext.isWeekday) {
      score += 8
    }

    return score
  } else if (statusCategory === 'done') {
    return -10 // Reduce closed tickets priority
  } else if (statusCategory === 'todo') {
    return 8 // Ready to start tickets
  }

  // Fallback to name-based detection for more granular scoring
  if (
    statusLower.includes('progress') ||
    statusLower.includes('development') ||
    statusLower.includes('doing')
  ) {
    let score = 20 // Active work gets highest priority

    // Extra boost on weekdays for active tickets
    if (timeContext.isWeekday) {
      score += 8
    }

    return score
  } else if (
    statusLower.includes('review') ||
    statusLower.includes('testing') ||
    statusLower.includes('qa')
  ) {
    let score = 15 // Review items are important

    // Boost review tickets on Monday (start of week planning)
    if (timeContext.isMonday) {
      score += 5
    }

    return score
  } else if (
    statusLower.includes('blocked') ||
    statusLower.includes('impediment')
  ) {
    return 12 // Blocked tickets need attention
  } else if (
    statusLower.includes('done') ||
    statusLower.includes('resolved') ||
    statusLower.includes('closed')
  ) {
    return -10 // Reduce closed tickets priority
  }

  return 0
}

function calculatePriorityScore(priority: JiraPriority | undefined): number {
  if (!priority?.name) return 0

  const priorityLower = priority.name.toLowerCase()

  if (priorityLower.includes('highest') || priorityLower.includes('critical')) {
    return 25
  } else if (priorityLower.includes('high')) {
    return 15
  } else if (priorityLower.includes('medium')) {
    return 5
  } else if (
    priorityLower.includes('low') ||
    priorityLower.includes('lowest')
  ) {
    return -5
  }

  return 0
}

function calculateProjectScore({
  ticket,
  primaryPrefix,
  tickets,
  now
}: {
  ticket: JiraTicket
  primaryPrefix: string
  tickets: JiraTicket[]
  now: number
}): number {
  let score = 0
  const projectTickets = tickets.filter(
    (t) => t.projectKey === ticket.projectKey
  )

  // Primary project boost
  if (primaryPrefix && ticket.key.startsWith(primaryPrefix)) {
    score += 15
  }

  // Project activity momentum
  const recentProjectViews = projectTickets.filter((t) => {
    const ticketDays =
      (now - new Date(t.lastViewed).getTime()) / (1000 * 60 * 60 * 24)
    return ticketDays < 3
  }).length

  if (recentProjectViews > 1) {
    score += Math.min(recentProjectViews * 3, 15) // Active project bonus
  }

  // Project size consideration - smaller projects might need more attention
  if (projectTickets.length < 5) {
    score += 3
  }

  return score
}

function calculateTimePatternScore(
  status: JiraStatus,
  timeContext: TimeContext
): number {
  const statusLower = (status?.name || '').toLowerCase()
  const statusCategory = status?.statusCategory?.name?.toLowerCase() || ''

  // End of week cleanup - boost review/testing tickets on Friday
  if (timeContext.isFriday) {
    if (statusLower.includes('review') || statusLower.includes('testing')) {
      return 8
    }
  }

  // Start of week planning - boost backlog/ready tickets on Monday
  if (timeContext.isMonday) {
    if (
      statusCategory === 'todo' ||
      statusLower.includes('backlog') ||
      statusLower.includes('ready') ||
      statusLower.includes('todo')
    ) {
      return 6
    }
  }

  return 0
}

/**
 * Memoized version of context scoring for performance optimization
 * Cache key is based on ticket key and critical context factors
 */
export const calculateContextScore = memoizeWithTTL(
  _calculateContextScore,
  5 * 60 * 1000, // 5 minutes TTL
  (ticket: JiraTicket, context: ScoringContext) => {
    // Create cache key based on ticket and context that affects scoring
    // 30-minute time buckets
    return `${ticket.key}-${context.isSearchMode}-${context.userEmail}-${context.primaryPrefix}-${context.viewHistory.length}-${Math.floor(context.now / (30 * 60 * 1000))}`
  }
)
