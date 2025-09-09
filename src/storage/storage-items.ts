/**
 * WXT storage item definitions
 */

import { storage } from '#imports'

import { StorageKey } from './keys'
import { STORAGE_DEFAULTS, type StorageValueRecord } from './schema'

/**
 * WXT storage items with type safety and default values
 */
export const storageItems = {
  [StorageKey.DarkMode]: storage.defineItem<
    StorageValueRecord[StorageKey.DarkMode]
  >(`local:${StorageKey.DarkMode}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.DarkMode]
  }),

  [StorageKey.ColorCard]: storage.defineItem<
    StorageValueRecord[StorageKey.ColorCard]
  >(`local:${StorageKey.ColorCard}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.ColorCard]
  }),

  [StorageKey.AutoFullScreen]: storage.defineItem<
    StorageValueRecord[StorageKey.AutoFullScreen]
  >(`local:${StorageKey.AutoFullScreen}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.AutoFullScreen]
  }),

  [StorageKey.CustomBackground]: storage.defineItem<
    StorageValueRecord[StorageKey.CustomBackground]
  >(`local:${StorageKey.CustomBackground}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.CustomBackground]
  }),

  [StorageKey.License]: storage.defineItem<
    StorageValueRecord[StorageKey.License]
  >(`local:${StorageKey.License}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.License]
  }),

  [StorageKey.JiraHost]: storage.defineItem<
    StorageValueRecord[StorageKey.JiraHost]
  >(`local:${StorageKey.JiraHost}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.JiraHost]
  }),

  [StorageKey.JiraApiToken]: storage.defineItem<
    StorageValueRecord[StorageKey.JiraApiToken]
  >(`local:${StorageKey.JiraApiToken}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.JiraApiToken]
  }),

  [StorageKey.JiraUserEmail]: storage.defineItem<
    StorageValueRecord[StorageKey.JiraUserEmail]
  >(`local:${StorageKey.JiraUserEmail}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.JiraUserEmail]
  }),

  [StorageKey.PrimaryIssueKeyPrefix]: storage.defineItem<
    StorageValueRecord[StorageKey.PrimaryIssueKeyPrefix]
  >(`local:${StorageKey.PrimaryIssueKeyPrefix}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.PrimaryIssueKeyPrefix]
  }),

  [StorageKey.TicketsData]: storage.defineItem<
    StorageValueRecord[StorageKey.TicketsData]
  >(`local:${StorageKey.TicketsData}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.TicketsData]
  }),

  [StorageKey.TicketViewHistory]: storage.defineItem<
    StorageValueRecord[StorageKey.TicketViewHistory]
  >(`local:${StorageKey.TicketViewHistory}`, {
    fallback: STORAGE_DEFAULTS[StorageKey.TicketViewHistory]
  })
} as const
