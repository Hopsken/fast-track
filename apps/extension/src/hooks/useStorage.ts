import { useState, useEffect } from 'react'

import { getStorageItem, StorageKey, StorageValue } from '@/lib/storage'
import { getLogger } from '~/utils/logger'

const log = getLogger('storage-hook')

/**
 * React hook for accessing WXT storage with automatic updates
 */
export function useStorage<T extends StorageKey>(
  key: T
): [
  StorageValue<T>,
  (
    value: StorageValue<T> | ((prev: StorageValue<T>) => StorageValue<T>)
  ) => void
] {
  const [storageItem] = useState(getStorageItem(key))
  const [value, setValue] = useState<StorageValue<T>>(storageItem.fallback)

  useEffect(() => {
    storageItem
      .getValue()
      .then((storageValue) => {
        setValue(storageValue)
      })
      .catch((error) => {
        log.warn(
          `Failed to get storage value for key ${storageItem.key}:`,
          error
        )
        setValue(storageItem.fallback)
      })

    // Watch for changes
    return storageItem.watch((newValue) => {
      setValue(newValue)
    })
  }, [storageItem])

  const setStorageValue = (
    newValue: StorageValue<T> | ((prev: StorageValue<T>) => StorageValue<T>)
  ) => {
    if (!storageItem) {
      log.warn(`Storage item not found for key: ${key}`)
      return
    }

    const finalValue =
      typeof newValue === 'function'
        ? (newValue as (prev: StorageValue<T>) => StorageValue<T>)(value)
        : newValue

    storageItem
      .setValue(finalValue)
      .then(() => setValue(finalValue))
      .catch((error) => {
        log.error(`Failed to set storage value for key ${key}:`, error)
      })
  }

  return [value, setStorageValue]
}

/**
 * Hook for multiple storage values
 */
export function useMultipleStorage<T extends StorageKey>(
  keys: readonly T[]
): [
  { [K in T]: StorageValue<K> },
  (updates: Partial<{ [K in T]: StorageValue<K> }>) => void
] {
  const [values, setValues] = useState<{ [K in T]: StorageValue<K> }>(() => {
    // Initialize with default values
    const initialValues = {} as { [K in T]: StorageValue<K> }
    keys.forEach((key) => {
      initialValues[key] = getStorageItem(key).fallback
    })
    return initialValues
  })

  useEffect(() => {
    // Get initial values
    const getInitialValues = async () => {
      const initialValues = {} as { [K in T]: StorageValue<K> }

      await Promise.all(
        keys.map(async (key) => {
          try {
            const value = await getStorageItem(key).getValue()
            initialValues[key] = value ?? getStorageItem(key).fallback
          } catch (error) {
            log.warn(`Failed to get initial value for ${key}:`, error)
            initialValues[key] = getStorageItem(key).fallback
          }
        })
      )

      setValues(initialValues)
    }

    getInitialValues()

    // Set up watchers
    const unwatchFunctions = keys.map((key) => {
      return getStorageItem(key).watch((newValue) => {
        setValues((prev) => ({
          ...prev,
          [key]: newValue ?? getStorageItem(key).fallback
        }))
      })
    })

    return () => {
      unwatchFunctions.forEach((unwatch) => unwatch())
    }
  }, [keys])

  const updateValues = async (
    updates: Partial<{ [K in T]: StorageValue<K> }>
  ) => {
    const updatePromises = Object.entries(updates).map(([key, value]) => {
      const storageItem = getStorageItem(key as StorageKey)
      return storageItem.setValue(value as never)
    })

    try {
      await Promise.all(updatePromises)
      setValues((prev) => ({ ...prev, ...updates }))
    } catch (error) {
      log.error('Failed to update storage values:', error)
    }
  }

  return [values, updateValues]
}
