import { describe, expect, it, vi } from 'vitest'

import { logging } from './lib/decorator'
import { ConsoleLogger, LoggerFactory } from './lib/logger'

class TestService {
  @logging()
  greet(name: string) {
    return `Hello, ${name}!`
  }
}

describe('LoggerFactory', () => {
  it('returns a singleton ConsoleLogger instance', () => {
    const first = LoggerFactory.getInstance()
    const second = LoggerFactory.getInstance()

    expect(first).toBeInstanceOf(ConsoleLogger)
    expect(second).toBe(first)
  })
})

describe('logging decorator', () => {
  it('logs before and after method calls', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const service = new TestService()

    const result = service.greet('Ada Lovelace')

    expect(result).toBe('Hello, Ada Lovelace!')
    expect(logSpy).toHaveBeenNthCalledWith(1, 'Calling greet with arguments:', [
      'Ada Lovelace'
    ])
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      'Method greet returned:',
      'Hello, Ada Lovelace!'
    )

    logSpy.mockRestore()
  })
})
