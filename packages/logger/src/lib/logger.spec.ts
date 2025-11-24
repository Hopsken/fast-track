import { describe, expect, it, vi } from 'vitest'

import { LoggerFactory } from './logger'

describe('logger', () => {
  it('logs without throwing', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const logger = LoggerFactory.getInstance()

    expect(() => logger.log('test')).not.toThrow()
    expect(() => logger.error('test')).not.toThrow()

    logSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
