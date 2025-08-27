import { storage } from '#imports'

export enum StorageKey {
  DarkMode = "dark-mode",
  ColorCard = "color-card",
  AutoFullScreen = "auto-fullscreen",
  CustomBackground = "custom-background",
  License = "ls-license",
  JiraUrl = "jira-url",
  PrimaryIssueKeyPrefix = "primary-issue-key-prefix"
}

export type StorageValueRecord = {
  [StorageKey.DarkMode]: "always" | "auto" | "disable"
  [StorageKey.ColorCard]: boolean
  [StorageKey.AutoFullScreen]: boolean
  [StorageKey.CustomBackground]:
    | undefined
    | {
        id: string
        url: string
        thumb_url: string
        instance_id: string
      }
  [StorageKey.License]: {
    valid: boolean
    lastChecked: string
    license_key: {
      key: string
    }
    instance: {
      id: string
    }
  } | null
  [StorageKey.JiraUrl]: string
  [StorageKey.PrimaryIssueKeyPrefix]: string
}

// Define storage items with WXT's type-safe storage API
export const storageItems = {
  [StorageKey.DarkMode]: storage.defineItem<StorageValueRecord[StorageKey.DarkMode]>(`local:${StorageKey.DarkMode}`, {
    fallback: 'auto' as const
  }),
  [StorageKey.ColorCard]: storage.defineItem<StorageValueRecord[StorageKey.ColorCard]>(`local:${StorageKey.ColorCard}`, {
    fallback: false
  }),
  [StorageKey.AutoFullScreen]: storage.defineItem<StorageValueRecord[StorageKey.AutoFullScreen]>(`local:${StorageKey.AutoFullScreen}`, {
    fallback: false
  }),
  [StorageKey.CustomBackground]: storage.defineItem<StorageValueRecord[StorageKey.CustomBackground]>(`local:${StorageKey.CustomBackground}`, {
    fallback: undefined
  }),
  [StorageKey.License]: storage.defineItem<StorageValueRecord[StorageKey.License]>(`local:${StorageKey.License}`, {
    fallback: null
  }),
  [StorageKey.JiraUrl]: storage.defineItem<StorageValueRecord[StorageKey.JiraUrl]>(`local:${StorageKey.JiraUrl}`, {
    fallback: ''
  }),
  [StorageKey.PrimaryIssueKeyPrefix]: storage.defineItem<StorageValueRecord[StorageKey.PrimaryIssueKeyPrefix]>(`local:${StorageKey.PrimaryIssueKeyPrefix}`, {
    fallback: ''
  })
} as const

export class PersistLayer {
  async get<T extends StorageKey>(key: T): Promise<StorageValueRecord[T]> {
    return await storageItems[key].getValue()
  }

  async set<T extends StorageKey>(key: T, value: StorageValueRecord[T]): Promise<void> {
    return await storageItems[key].setValue(value)
  }

  async remove<T extends StorageKey>(key: T): Promise<void> {
    return await storageItems[key].removeValue()
  }

  watch<T extends StorageKey>(key: T, callback: (newValue: StorageValueRecord[T] | null, oldValue: StorageValueRecord[T] | null) => void) {
    return storageItems[key].watch(callback)
  }
}

export const persistLayer = new PersistLayer()

// React hooks for storage items
import { useState, useEffect } from 'react'

export function useStorage<T extends StorageKey>(
  key: T,
  defaultValue?: StorageValueRecord[T]
): [StorageValueRecord[T], (value: StorageValueRecord[T]) => void] {
  const [value, setValue] = useState<StorageValueRecord[T]>(defaultValue)

  useEffect(() => {
    // Get initial value
    storageItems[key].getValue().then(setValue)
    
    // Watch for changes
    const unwatch = storageItems[key].watch((newValue) => {
      if (newValue !== null) {
        setValue(newValue)
      }
    })

    return unwatch
  }, [key])

  const setStorageValue = (newValue: StorageValueRecord[T]) => {
    storageItems[key].setValue(newValue)
    setValue(newValue)
  }

  return [value, setStorageValue]
}
