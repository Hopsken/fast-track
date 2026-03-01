import { addDays, addMonths, addWeeks, nextMonday, startOfDay } from 'date-fns'
import { describe, expect, it } from 'vitest'

import {
  DATE_PRESETS,
  DATETIME_PRESETS,
  getDatePreset,
  getDatetimePreset,
  isPresetKey
} from './temporalPresets'

const REF = new Date('2026-01-05T12:00:00.000Z') // Monday Jan 5 2026

describe('isPresetKey', () => {
  it('returns true for @-prefixed keys', () => {
    expect(isPresetKey('@today')).toBe(true)
    expect(isPresetKey('@tomorrow')).toBe(true)
    expect(isPresetKey('@+1w')).toBe(true)
  })

  it('returns false for ISO dates and plain strings', () => {
    expect(isPresetKey('2026-01-05')).toBe(false)
    expect(isPresetKey('tomorrow')).toBe(false)
    expect(isPresetKey('')).toBe(false)
  })
})

describe('DATE_PRESETS', () => {
  it('has the expected keys', () => {
    const keys = DATE_PRESETS.map((p) => p.key)
    expect(keys).toEqual([
      '@today',
      '@tomorrow',
      '@+3d',
      '@next_monday',
      '@+1w',
      '@+2w',
      '@+1m'
    ])
  })

  it('@today resolves to start of ref day', () => {
    const preset = getDatePreset('@today')!
    expect(preset.resolve(REF)).toEqual(startOfDay(REF))
  })

  it('@tomorrow resolves to start of next day', () => {
    const preset = getDatePreset('@tomorrow')!
    expect(preset.resolve(REF)).toEqual(startOfDay(addDays(REF, 1)))
  })

  it('@+3d resolves to 3 days from ref', () => {
    const preset = getDatePreset('@+3d')!
    expect(preset.resolve(REF)).toEqual(startOfDay(addDays(REF, 3)))
  })

  it('@next_monday resolves to next Monday from ref', () => {
    const preset = getDatePreset('@next_monday')!
    expect(preset.resolve(REF)).toEqual(startOfDay(nextMonday(REF)))
  })

  it('@+1w resolves to 1 week from ref', () => {
    const preset = getDatePreset('@+1w')!
    expect(preset.resolve(REF)).toEqual(startOfDay(addWeeks(REF, 1)))
  })

  it('@+2w resolves to 2 weeks from ref', () => {
    const preset = getDatePreset('@+2w')!
    expect(preset.resolve(REF)).toEqual(startOfDay(addWeeks(REF, 2)))
  })

  it('@+1m resolves to 1 month from ref', () => {
    const preset = getDatePreset('@+1m')!
    expect(preset.resolve(REF)).toEqual(startOfDay(addMonths(REF, 1)))
  })
})

describe('DATETIME_PRESETS', () => {
  it('has the same keys as DATE_PRESETS', () => {
    expect(DATETIME_PRESETS.map((p) => p.key)).toEqual(
      DATE_PRESETS.map((p) => p.key)
    )
  })

  it('@tomorrow resolves to next day at 9:00 AM', () => {
    const preset = getDatetimePreset('@tomorrow')!
    const resolved = preset.resolve(REF)
    const expected = startOfDay(addDays(REF, 1))
    expected.setHours(9, 0, 0, 0)
    expect(resolved).toEqual(expected)
  })

  it('@today resolves to today at 9:00 AM', () => {
    const preset = getDatetimePreset('@today')!
    const resolved = preset.resolve(REF)
    const expected = startOfDay(REF)
    expected.setHours(9, 0, 0, 0)
    expect(resolved).toEqual(expected)
  })
})

describe('getDatePreset / getDatetimePreset', () => {
  it('returns undefined for unknown key', () => {
    expect(getDatePreset('@unknown')).toBeUndefined()
    expect(getDatetimePreset('@unknown')).toBeUndefined()
  })

  it('returns undefined for non-preset string', () => {
    expect(getDatePreset('2026-01-01')).toBeUndefined()
  })
})
