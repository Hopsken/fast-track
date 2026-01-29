import { LoggerFactory } from './logger'

const logger = LoggerFactory.getInstance()

export function logging() {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown
    descriptor.value = function (...args: unknown[]) {
      logger.log(`Calling ${propertyKey} with arguments:`, args)
      const result = originalMethod.apply(this, args)
      logger.log(`Method ${propertyKey} returned:`, result)
      return result
    }
    return descriptor
  }
}
