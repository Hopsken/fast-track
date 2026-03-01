import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getSemanticTemporalLabel,
  getTemporalLabel,
  resolveTemporalValue
} from './resolvePreset'

const REF = new Date('2026-01-05T00:00:00.000') // Monday Jan 5 2026, local midnight

describe('resolveTemporalValue — date mode', () => {
  it('resolves @today preset', () => {
    const result = resolveTemporalValue('@today', 'date', REF)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.iso).toBe('2026-01-05')
    expect(result.label).toBe('Today')
  })

  it('resolves @tomorrow preset', () => {
    const result = resolveTemporalValue('@tomorrow', 'date', REF)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.iso).toBe('2026-01-06')
    expect(result.label).toBe('Tomorrow')
  })

  it('resolves @+3d preset', () => {
    const result = resolveTemporalValue('@+3d', 'date', REF)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.iso).toBe('2026-01-08')
  })

  it('resolves @+1w preset', () => {
    const result = resolveTemporalValue('@+1w', 'date', REF)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.iso).toBe('2026-01-12')
  })

  it('passes through ISO literal date', () => {
    const result = resolveTemporalValue('2026-03-15', 'date', REF)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.iso).toBe('2026-03-15')
  })

  it('returns ok:false for unknown preset key', () => {
    const result = resolveTemporalValue('@unknown', 'date', REF)
    expect(result.ok).toBe(false)
  })

  it('returns ok:false for invalid string', () => {
    const result = resolveTemporalValue('not-a-date', 'date', REF)
    expect(result.ok).toBe(false)
  })

  it('returns ok:false for empty string', () => {
    const result = resolveTemporalValue('', 'date', REF)
    expect(result.ok).toBe(false)
  })
})

describe('resolveTemporalValue — datetime mode', () => {
  it('resolves @+1h preset to ref + 1 hour', () => {
    const result = resolveTemporalValue('@+1h', 'datetime', REF)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.iso).toMatch(/^2026-01-05T01:00:00\.000/)
    expect(result.label).toBe('In 1 hour')
  })

  it('resolves @eod preset to today at 17:00', () => {
    const result = resolveTemporalValue('@eod', 'datetime', REF)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.iso).toMatch(/^2026-01-05T17:00:00\.000/)
    expect(result.label).toBe('End of day')
  })

  it('resolves @tomorrow preset with 9:00 AM time', () => {
    const result = resolveTemporalValue('@tomorrow', 'datetime', REF)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.iso).toMatch(/^2026-01-06T09:00:00\.000/)
    expect(result.label).toBe('Tomorrow 9am')
  })

  it('passes through ISO datetime literal', () => {
    const result = resolveTemporalValue(
      '2026-03-15T14:30:00.000+00:00',
      'datetime',
      REF
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.iso).toMatch(/^2026-03-15T/)
  })
})

describe('getTemporalLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(REF)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns preset label for preset key', () => {
    expect(getTemporalLabel('@tomorrow', 'date')).toBe('Tomorrow')
    expect(getTemporalLabel('@today', 'date')).toBe('Today')
  })

  it('returns formatted date for ISO literal', () => {
    const label = getTemporalLabel('2026-03-15', 'date')
    expect(label).toBe('Mar 15, 2026')
  })

  it('returns formatted datetime for ISO datetime literal', () => {
    const label = getTemporalLabel('2026-03-15T09:00:00.000+00:00', 'datetime')
    expect(label).toMatch(/Mar 15, 2026/)
  })

  it('returns raw value for unrecognized input', () => {
    expect(getTemporalLabel('@unknown', 'date')).toBe('@unknown')
    expect(getTemporalLabel('garbage', 'date')).toBe('garbage')
  })
})

describe('getSemanticTemporalLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(REF)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty string for empty value', () => {
    expect(getSemanticTemporalLabel('', 'date')).toBe('')
  })

  it('delegates preset key to getTemporalLabel (date mode)', () => {
    expect(getSemanticTemporalLabel('@tomorrow', 'date')).toBe('Tomorrow')
    expect(getSemanticTemporalLabel('@today', 'date')).toBe('Today')
  })

  it('ISO today → "Today" (date mode)', () => {
    expect(getSemanticTemporalLabel('2026-01-05', 'date')).toBe('Today')
  })

  it('ISO tomorrow → "Tomorrow" (date mode)', () => {
    expect(getSemanticTemporalLabel('2026-01-06', 'date')).toBe('Tomorrow')
  })

  it('ISO yesterday → "Yesterday" (date mode)', () => {
    expect(getSemanticTemporalLabel('2026-01-04', 'date')).toBe('Yesterday')
  })

  // Current week: diff +2 to +6 → weekday only
  it('ISO +2 days (Wed Jan 7) → "Wednesday" (date mode)', () => {
    expect(getSemanticTemporalLabel('2026-01-07', 'date')).toBe('Wednesday')
  })

  it('ISO +6 days (Sun Jan 11) → "Sunday" (date mode)', () => {
    expect(getSemanticTemporalLabel('2026-01-11', 'date')).toBe('Sunday')
  })

  // Jan 3 (Sat) is in the previous calendar week from Jan 5 (Mon) → Last prefix
  it('ISO -2 days (Sat Jan 3) → "Last Saturday, Jan 3" (date mode)', () => {
    expect(getSemanticTemporalLabel('2026-01-03', 'date')).toBe(
      'Last Saturday, Jan 3'
    )
  })

  // Next week: diff +7 to +13 → "Next Weekday, MMM d"
  it('ISO +7 days (Mon Jan 12) → "Next Monday, Jan 12" (date mode)', () => {
    expect(getSemanticTemporalLabel('2026-01-12', 'date')).toBe(
      'Next Monday, Jan 12'
    )
  })

  it('ISO +13 days (Sun Jan 18) → "Next Sunday, Jan 18" (date mode)', () => {
    expect(getSemanticTemporalLabel('2026-01-18', 'date')).toBe(
      'Next Sunday, Jan 18'
    )
  })

  // Last week: diff -7 to -13 → "Last Weekday, MMM d"
  it('ISO -7 days (Mon Dec 29) → "Last Monday, Dec 29" (date mode)', () => {
    expect(getSemanticTemporalLabel('2025-12-29', 'date')).toBe(
      'Last Monday, Dec 29'
    )
  })

  // Beyond ±14: fallback to MMM d or MMM d, yyyy
  it('ISO +14 days (Mon Jan 19) → "Jan 19" (date mode)', () => {
    expect(getSemanticTemporalLabel('2026-01-19', 'date')).toBe('Jan 19')
  })

  it('ISO same-year non-near → "MMM d" no year (date mode)', () => {
    expect(getSemanticTemporalLabel('2026-03-15', 'date')).toBe('Mar 15')
  })

  it('ISO other-year → "MMM d, yyyy" (date mode)', () => {
    expect(getSemanticTemporalLabel('2027-03-15', 'date')).toBe('Mar 15, 2027')
  })

  it('ISO today → "Today at H:MM AM" (datetime mode)', () => {
    const label = getSemanticTemporalLabel(
      '2026-01-05T09:00:00.000+00:00',
      'datetime'
    )
    expect(label).toMatch(/^Today at /)
  })

  it('ISO tomorrow → "Tomorrow at 9:00 AM" (datetime mode)', () => {
    const label = getSemanticTemporalLabel(
      '2026-01-06T09:00:00.000+00:00',
      'datetime'
    )
    expect(label).toMatch(/^Tomorrow at /)
  })
})
