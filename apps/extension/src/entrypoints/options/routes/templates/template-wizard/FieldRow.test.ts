import { describe, expect, it } from 'vitest'

import type { FieldConfig } from '~/types/template'

import { buildConfigForMode } from './FieldRow'

const FIELD_ID = 'priority'

const jiraAllowedValues = [
  { id: '1', name: 'High' },
  { id: '2', name: 'Medium' },
  { id: '3', name: 'Low' }
]

describe('buildConfigForMode', () => {
  /* ---------------------------------------------------------------- */
  /*  preset → restricted                                              */
  /* ---------------------------------------------------------------- */

  describe('switching to restricted', () => {
    it('preserves existing allowedOptions from a prior config', () => {
      const userOptions = [{ id: '1', name: 'High' }]
      const config: FieldConfig = {
        fieldId: FIELD_ID,
        behavior: 'preset',
        presetValue: { id: '1', name: 'High' },
        allowedOptions: userOptions
      }

      const result = buildConfigForMode(
        'restricted',
        FIELD_ID,
        config,
        jiraAllowedValues
      )

      expect(result.behavior).toBe('restricted')
      expect(result.allowedOptions).toEqual(userOptions)
    })

    it('preserves presetValue when switching to restricted', () => {
      const config: FieldConfig = {
        fieldId: FIELD_ID,
        behavior: 'preset',
        presetValue: { id: '1', name: 'High' },
        allowedOptions: [{ id: '1', name: 'High' }]
      }

      const result = buildConfigForMode(
        'restricted',
        FIELD_ID,
        config,
        jiraAllowedValues
      )

      expect(result.presetValue).toEqual({ id: '1', name: 'High' })
    })

    it('initialises from Jira allowedValues when no prior allowedOptions', () => {
      const config: FieldConfig = {
        fieldId: FIELD_ID,
        behavior: 'preset',
        presetValue: { id: '1', name: 'High' }
      }

      const result = buildConfigForMode(
        'restricted',
        FIELD_ID,
        config,
        jiraAllowedValues
      )

      expect(result.allowedOptions).toEqual(jiraAllowedValues)
    })

    it('starts empty when no prior options and no Jira allowedValues', () => {
      const config: FieldConfig = {
        fieldId: FIELD_ID,
        behavior: 'preset',
        presetValue: 'some text'
      }

      const result = buildConfigForMode(
        'restricted',
        FIELD_ID,
        config,
        undefined
      )

      expect(result.allowedOptions).toEqual([])
    })

    it('starts empty when Jira allowedValues is an empty array', () => {
      const config: FieldConfig = {
        fieldId: FIELD_ID,
        behavior: 'preset',
        presetValue: 5
      }

      const result = buildConfigForMode('restricted', FIELD_ID, config, [])

      expect(result.allowedOptions).toEqual([])
    })
  })

  /* ---------------------------------------------------------------- */
  /*  restricted → preset                                              */
  /* ---------------------------------------------------------------- */

  describe('switching to preset', () => {
    it('preserves existing presetValue from a prior config', () => {
      const config: FieldConfig = {
        fieldId: FIELD_ID,
        behavior: 'restricted',
        allowedOptions: [{ id: '1', name: 'High' }],
        presetValue: { id: '2', name: 'Medium' }
      }

      const result = buildConfigForMode(
        'preset',
        FIELD_ID,
        config,
        jiraAllowedValues
      )

      expect(result.behavior).toBe('preset')
      expect(result.presetValue).toEqual({ id: '2', name: 'Medium' })
    })

    it('preserves allowedOptions when switching to preset', () => {
      const options = [{ id: '1', name: 'High' }]
      const config: FieldConfig = {
        fieldId: FIELD_ID,
        behavior: 'restricted',
        allowedOptions: options,
        presetValue: { id: '2', name: 'Medium' }
      }

      const result = buildConfigForMode(
        'preset',
        FIELD_ID,
        config,
        jiraAllowedValues
      )

      expect(result.allowedOptions).toEqual(options)
    })

    it('sets presetValue to undefined when no prior value exists', () => {
      const config: FieldConfig = {
        fieldId: FIELD_ID,
        behavior: 'restricted',
        allowedOptions: [{ id: '1', name: 'High' }]
      }

      const result = buildConfigForMode(
        'preset',
        FIELD_ID,
        config,
        jiraAllowedValues
      )

      expect(result.presetValue).toBeUndefined()
    })
  })

  /* ---------------------------------------------------------------- */
  /*  Round-trip preservation                                          */
  /* ---------------------------------------------------------------- */

  describe('round-trip: preset → restricted → preset', () => {
    it('preserves both values across mode switches', () => {
      const initial: FieldConfig = {
        fieldId: FIELD_ID,
        behavior: 'preset',
        presetValue: { id: '2', name: 'Medium' },
        allowedOptions: [{ id: '1', name: 'High' }]
      }

      // preset → restricted
      const afterRestricted = buildConfigForMode(
        'restricted',
        FIELD_ID,
        initial,
        jiraAllowedValues
      )
      expect(afterRestricted.allowedOptions).toEqual([
        { id: '1', name: 'High' }
      ])
      expect(afterRestricted.presetValue).toEqual({
        id: '2',
        name: 'Medium'
      })

      // restricted → preset (values carried on the config itself)
      const afterPreset = buildConfigForMode(
        'preset',
        FIELD_ID,
        afterRestricted,
        jiraAllowedValues
      )
      expect(afterPreset.presetValue).toEqual({ id: '2', name: 'Medium' })
      expect(afterPreset.allowedOptions).toEqual([{ id: '1', name: 'High' }])
    })
  })
})
