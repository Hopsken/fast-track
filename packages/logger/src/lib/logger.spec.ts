import { LoggerFactory } from './logger'

describe('logger', () => {
  it('should work', () => {
    const logger = LoggerFactory.getInstance()
    expect(logger.log('test')).not.toThrow()
    expect(logger.error('test')).not.toThrow()
  })
})
