import { describe, expect, it } from 'vitest'

import { JiraTextAreaAdapter } from './textarea'

describe('JiraTextAreaAdapter', () => {
  describe('toDTO', () => {
    it('produces a valid ADF document', () => {
      const result = JiraTextAreaAdapter.toDTO('hello world')
      expect(result).toMatchObject({
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'hello world' }]
          }
        ]
      })
    })

    it('splits multiline text into multiple paragraphs', () => {
      const result = JiraTextAreaAdapter.toDTO('line1\nline2') as {
        content: Array<{ content: Array<{ text: string }> }>
      }
      expect(result.content).toHaveLength(2)
      expect(result.content[0]?.content[0]?.text).toBe('line1')
      expect(result.content[1]?.content[0]?.text).toBe('line2')
    })
  })

  describe('fromDTO', () => {
    it('extracts text from ADF document (v3 API response)', () => {
      const adf = {
        type: 'doc',
        version: 1,
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }
        ]
      }
      expect(JiraTextAreaAdapter.fromDTO(adf)).toBe('hello')
    })

    it('falls back to string for legacy plain-string DTOs', () => {
      expect(JiraTextAreaAdapter.fromDTO('plain string')).toBe('plain string')
    })

    it('returns null for unrecognised input', () => {
      expect(JiraTextAreaAdapter.fromDTO(null)).toBeNull()
      expect(JiraTextAreaAdapter.fromDTO(42)).toBeNull()
    })
  })
})
