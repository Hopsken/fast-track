/**
 * Storage module - Clean barrel exports
 * This provides a unified API for all storage-related functionality
 */

// Type exports
export type {
  JiraTicket,
  TicketViewRecord,
  CustomBackground,
  LicenseInfo,
  DarkModeOption,
  JiraApiConfig,
  StorageValueRecord,
} from './types'

export type { StorageValueRecord as StorageSchema } from './schema'

// Storage configuration
export { StorageKey, STORAGE_GROUPS } from './keys'
export { STORAGE_DEFAULTS } from './schema'

// Storage layer
export { PersistLayer, persistLayer } from './storage-layer'
export { storageItems } from './storage-items'

// Re-export for backward compatibility
export const PersistLayer_Legacy = PersistLayer

// Hooks
export { useStorage } from '~/hooks/useStorage'