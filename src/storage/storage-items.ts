/**
 * WXT storage item definitions
 */

import { storage, WxtStorageItem } from '#imports'

import { StorageKey } from './keys'
import { STORAGE_DEFAULTS, StorageValue } from './schema'

/**
 * WXT storage items with type safety and default values
 */
export const storageItems: Record<
  StorageKey,
  WxtStorageItem<StorageValue<StorageKey>, Record<string, unknown>>
> = {
  [StorageKey.DarkMode]: storage.defineItem(`local:${StorageKey.DarkMode}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.DarkMode]
  }),

  [StorageKey.ColorCard]: storage.defineItem(`local:${StorageKey.ColorCard}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.ColorCard]
  }),

  [StorageKey.AutoFullScreen]: storage.defineItem(
    `local:${StorageKey.AutoFullScreen}`,
    {
      fallback: STORAGE_DEFAULTS[StorageKey.AutoFullScreen]
    }
  ),

  [StorageKey.CustomBackground]: storage.defineItem(
    `local:${StorageKey.CustomBackground}`,
    {
      fallback: STORAGE_DEFAULTS[StorageKey.CustomBackground]
    }
  ),

  [StorageKey.License]: storage.defineItem(`local:${StorageKey.License}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.License]
  }),

  [StorageKey.JiraHost]: storage.defineItem(`local:${StorageKey.JiraHost}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.JiraHost]
  }),

  [StorageKey.JiraApiToken]: storage.defineItem(
    `local:${StorageKey.JiraApiToken}`,
    {
      fallback: STORAGE_DEFAULTS[StorageKey.JiraApiToken]
    }
  ),

  [StorageKey.JiraUserEmail]: storage.defineItem(
    `local:${StorageKey.JiraUserEmail}`,
    {
      fallback: STORAGE_DEFAULTS[StorageKey.JiraUserEmail]
    }
  ),

  [StorageKey.PrimaryIssueKeyPrefix]: storage.defineItem(
    `local:${StorageKey.PrimaryIssueKeyPrefix}`,
    {
      fallback: STORAGE_DEFAULTS[StorageKey.PrimaryIssueKeyPrefix]
    }
  ),

  [StorageKey.TicketsData]: storage.defineItem(
    `local:${StorageKey.TicketsData}`,
    {
      fallback: STORAGE_DEFAULTS[StorageKey.TicketsData]
    }
  ),

  [StorageKey.TicketViewHistory]: storage.defineItem(
    `local:${StorageKey.TicketViewHistory}`,
    {
      fallback: STORAGE_DEFAULTS[StorageKey.TicketViewHistory]
    }
  )
} as const
