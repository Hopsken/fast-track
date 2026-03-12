import { describe, expect, it } from 'vitest'

import { adfToText, textToAdf } from './adf'

describe('textToAdf', () => {
  it('wraps single line in a paragraph', () => {
    expect(textToAdf('hello')).toEqual({
      type: 'doc',
      version: 1,
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }
      ]
    })
  })

  it('splits multiline text into multiple paragraphs', () => {
    const result = textToAdf('line1\nline2')
    expect(result.content).toHaveLength(2)
    expect(result.content[0]?.content[0]?.text).toBe('line1')
    expect(result.content[1]?.content[0]?.text).toBe('line2')
  })

  it('produces empty paragraph content for empty string', () => {
    const result = textToAdf('')
    expect(result.content).toHaveLength(1)
    expect(result.content[0]?.content).toEqual([])
  })
})

describe('adfToText', () => {
  it('extracts text from valid ADF doc', () => {
    const doc = {
      type: 'doc',
      version: 1,
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }
      ]
    }
    expect(adfToText(doc)).toBe('hello')
  })

  it('joins multiple paragraphs with newlines', () => {
    const doc = {
      type: 'doc',
      version: 1,
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'line1' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'line2' }] }
      ]
    }
    expect(adfToText(doc)).toBe('line1\nline2')
  })

  it('returns null for plain string input', () => {
    expect(adfToText('plain text')).toBeNull()
  })

  it('returns null for null', () => {
    expect(adfToText(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(adfToText(undefined)).toBeNull()
  })

  it('returns null for non-doc object', () => {
    expect(adfToText({ type: 'paragraph' })).toBeNull()
  })
})
