import loglevel from 'loglevel'

const DEFAULT_LEVEL: loglevel.LogLevelDesc = import.meta.env.DEV
  ? 'debug'
  : 'info'

loglevel.setDefaultLevel(DEFAULT_LEVEL)

export const logger = (() => {
  const extensionLogger = loglevel.getLogger('extension')
  extensionLogger.setLevel(DEFAULT_LEVEL)
  return extensionLogger
})()

export const getLogger = (name?: string) => {
  const namespacedLogger = loglevel.getLogger(
    name ? `extension:${name}` : 'extension'
  )
  namespacedLogger.setLevel(DEFAULT_LEVEL)
  return namespacedLogger
}
