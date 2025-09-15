import { LoggerFactory } from './logger'

const logger = LoggerFactory.getInstance()

export function logging() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      logger.log(`Calling ${propertyKey} with arguments:`, args)
      const result = originalMethod.apply(this, args)
      logger.log(`Method ${propertyKey} returned:`, result)
      return result
    }
    return descriptor
  }
}
