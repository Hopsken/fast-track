/**
 * Storage value type mapping and schema definitions
 */

import { StorageKey } from './keys'
import type {
  JiraTicket,
  TicketViewRecord,
  CustomBackground,
  LicenseInfo,
  DarkModeOption
} from './types'

/**
 * Maps storage keys to their value types
 */
export type StorageValueRecord = {
  [StorageKey.DarkMode]: DarkModeOption
  [StorageKey.ColorCard]: boolean
  [StorageKey.AutoFullScreen]: boolean
  [StorageKey.CustomBackground]: CustomBackground | undefined
  [StorageKey.License]: LicenseInfo | null
  [StorageKey.JiraUrl]: string
  [StorageKey.JiraHost]: string
  [StorageKey.JiraApiToken]: string
  [StorageKey.JiraUserEmail]: string
  [StorageKey.PrimaryIssueKeyPrefix]: string
  [StorageKey.TicketsData]: JiraTicket[]
  [StorageKey.SearchHistory]: string[]
  [StorageKey.TicketViewHistory]: TicketViewRecord[]
}

/**
 * Default values for storage items
 */
export const STORAGE_DEFAULTS: { [K in StorageKey]: StorageValueRecord[K] } = {
  [StorageKey.DarkMode]: 'auto' as const,
  [StorageKey.ColorCard]: false,
  [StorageKey.AutoFullScreen]: false,
  [StorageKey.CustomBackground]: undefined,
  [StorageKey.License]: null,
  [StorageKey.JiraUrl]: '',
  [StorageKey.JiraHost]: '',
  [StorageKey.JiraApiToken]: '',
  [StorageKey.JiraUserEmail]: '',
  [StorageKey.PrimaryIssueKeyPrefix]: '',
  [StorageKey.TicketsData]: [],
  [StorageKey.SearchHistory]: [],
  [StorageKey.TicketViewHistory]: []
}
