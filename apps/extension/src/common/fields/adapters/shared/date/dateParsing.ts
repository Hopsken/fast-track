import * as chrono from 'chrono-node'
import { format, isValid, parseISO } from 'date-fns'

export const toJiraDate = (date: Date) => format(date, 'yyyy-MM-dd')

export const parseJiraDate = (raw: string) => {
  const parsed = parseISO(raw)
  return isValid(parsed) ? parsed : null
}

export const parseNaturalDate = (raw: string) => {
  const input = raw.trim()
  if (!input) return null

  const parsed = chrono.parseDate(input, new Date(), { forwardDate: true })
  if (parsed != null && isValid(parsed)) return parsed

  return parseJiraDate(input)
}

export const parseNaturalDateTime = (raw: string) => {
  const input = raw.trim()
  if (!input) return null

  // Try natural language parsing with time support
  const parsed = chrono.parseDate(input, new Date(), { forwardDate: true })
  if (parsed != null && isValid(parsed)) return parsed

  // Fallback to ISO datetime parsing
  const isoParsed = parseISO(input)
  return isValid(isoParsed) ? isoParsed : null
}

export function toJiraDateTime(d: Date): string {
  // Use standard ISO 8601 format with colon in timezone offset
  // e.g. 2026-02-08T13:45:00.000+08:00
  return format(d, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
}

export type SemanticTemporalKind = 'absolute' | 'relative'

export type SemanticTemporalParseResult =
  | { status: 'empty' }
  | { status: 'invalid'; reason: 'unrecognized' | 'partial_match' }
  | {
      status: 'valid'
      kind: SemanticTemporalKind
      raw: string
      resolved: Date
      /** strict Jira-formatted value */
      iso: string
    }

const RELATIVE_HINT_RE =
  /\b(today|tomorrow|yesterday|now|next|last|this|in|after|before|ago|from\s+now|weekday|weekend|eod|eom)\b/i

const WEEKDAY_RE =
  /\b(mon(day)?|tue(s(day)?)?|wed(nesday)?|thu(r(s(day)?)?)?|fri(day)?|sat(urday)?|sun(day)?)\b/i

function isChronoFullMatch(result: chrono.ParsedResult, input: string) {
  // chrono can return partial matches; we only accept if it parsed the whole input.
  return result.index === 0 && result.text.length === input.length
}

function detectKind(input: string, result?: chrono.ParsedResult): SemanticTemporalKind {
  const trimmed = input.trim()

  // Strong text hints
  if (RELATIVE_HINT_RE.test(trimmed)) return 'relative'
  if (WEEKDAY_RE.test(trimmed)) return 'relative'

  const tags = result?.tags?.()
  if (tags) {
    for (const tag of tags) {
      if (tag.startsWith('result/relative')) return 'relative'
      if (tag.startsWith('casualReference/')) return 'relative'
    }
  }

  // If user only specified weekday (no explicit calendar date), treat as relative.
  const known = result?.start?.knownValues
  if (known && 'weekday' in known && !('day' in known) && !('month' in known)) {
    return 'relative'
  }

  return 'absolute'
}

export function parseSemanticDateValue(
  raw: string,
  opts?: { referenceDate?: Date }
): SemanticTemporalParseResult {
  const input = raw.trim()
  if (!input) return { status: 'empty' }

  const ref = opts?.referenceDate ?? new Date()

  const results = chrono.parse(input, ref, { forwardDate: true })
  const first = results[0]

  let resolved: Date | null = null
  let kind: SemanticTemporalKind = 'absolute'

  if (first && isChronoFullMatch(first, input)) {
    const date = first.start.date()
    if (date && isValid(date)) {
      resolved = date
      kind = detectKind(input, first)
    }
  }

  if (!resolved) {
    const parsedIso = parseJiraDate(input)
    if (parsedIso) {
      resolved = parsedIso
      kind = 'absolute'
    }
  }

  if (!resolved) {
    // If chrono could parse *something*, treat it as invalid to avoid silently accepting partials.
    if (first) return { status: 'invalid', reason: 'partial_match' }
    return { status: 'invalid', reason: 'unrecognized' }
  }

  return {
    status: 'valid',
    kind,
    raw: input,
    resolved,
    iso: toJiraDate(resolved)
  }
}

function withDefaultTime(date: Date, defaultTime: { h: number; m: number }) {
  const next = new Date(date)
  next.setHours(defaultTime.h, defaultTime.m, 0, 0)
  return next
}

export function parseSemanticDateTimeValue(
  raw: string,
  opts?: { referenceDate?: Date; defaultTime?: { h: number; m: number } }
): SemanticTemporalParseResult {
  const input = raw.trim()
  if (!input) return { status: 'empty' }

  const ref = opts?.referenceDate ?? new Date()
  const defaultTime = opts?.defaultTime ?? { h: 9, m: 0 }

  const results = chrono.parse(input, ref, { forwardDate: true })
  const first = results[0]

  let resolved: Date | null = null
  let kind: SemanticTemporalKind = 'absolute'
  let hasExplicitTime = false

  if (first && isChronoFullMatch(first, input)) {
    const date = first.start.date()
    if (date && isValid(date)) {
      resolved = date
      kind = detectKind(input, first)
      hasExplicitTime = first.start.isCertain('hour')
    }
  }

  if (!resolved) {
    try {
      const isoParsed = parseISO(input)
      if (isValid(isoParsed)) {
        resolved = isoParsed
        kind = 'absolute'
        hasExplicitTime = true
      }
    } catch {
      // ignore
    }
  }

  if (!resolved) {
    if (first) return { status: 'invalid', reason: 'partial_match' }
    return { status: 'invalid', reason: 'unrecognized' }
  }

  const resolvedWithTime = hasExplicitTime
    ? resolved
    : withDefaultTime(resolved, defaultTime)

  return {
    status: 'valid',
    kind,
    raw: input,
    resolved: resolvedWithTime,
    iso: toJiraDateTime(resolvedWithTime)
  }
}

export function isValidSemanticDateValue(raw: string) {
  const res = parseSemanticDateValue(raw)
  return res.status === 'valid'
}

export function isValidSemanticDateTimeValue(raw: string) {
  const res = parseSemanticDateTimeValue(raw)
  return res.status === 'valid'
}
