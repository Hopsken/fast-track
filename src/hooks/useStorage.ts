/**
 * Main storage hook for React components
 */

import { useState, useEffect } from 'react'

import { StorageKey, STORAGE_GROUPS } from '~/storage/keys'
import type { StorageValueRecord } from '~/storage/schema'
import { STORAGE_DEFAULTS } from '~/storage/schema'
import { storageItems } from '~/storage/storage-items'

/**
 * React hook for accessing WXT storage with automatic updates
 */
export function useStorage<T extends StorageKey>(
  key: T,
  defaultValue?: StorageValueRecord[T]
): [
  StorageValueRecord[T],
  (
    value:
      | StorageValueRecord[T]
      | ((prev: StorageValueRecord[T]) => StorageValueRecord[T])
  ) => void
] {
  const [fallbackValue] = useState(
    (defaultValue ?? STORAGE_DEFAULTS[key]) as StorageValueRecord[T]
  )
  const [value, setValue] = useState<StorageValueRecord[T]>(fallbackValue)

  useEffect(() => {
    // Get initial value safely
    const storageItem = storageItems[key]

    if (storageItem) {
      storageItem
        .getValue()
        .then((storageValue) => {
          setValue((storageValue ?? fallbackValue) as StorageValueRecord[T])
        })
        .catch((error) => {
          console.warn(`Failed to get storage value for key ${key}:`, error)
          setValue(fallbackValue)
        })

      // Watch for changes
      return storageItem.watch((newValue) => {
        setValue((newValue ?? fallbackValue) as StorageValueRecord[T])
      })
    } else {
      console.warn(`Storage item not found for key: ${key}`)
      setValue(fallbackValue)
    }
  }, [key, fallbackValue])

  const setStorageValue = (
    newValue:
      | StorageValueRecord[T]
      | ((prev: StorageValueRecord[T]) => StorageValueRecord[T])
  ) => {
    const storageItem = storageItems[key]

    if (storageItem) {
      const finalValue =
        typeof newValue === 'function'
          ? (
              newValue as (prev: StorageValueRecord[T]) => StorageValueRecord[T]
            )(value)
          : newValue

      storageItem
        .setValue(finalValue as never)
        .then(() => setValue(finalValue))
        .catch((error) => {
          console.error(`Failed to set storage value for key ${key}:`, error)
        })
    } else {
      console.warn(`Storage item not found for key: ${key}`)
    }
  }

  return [value, setStorageValue]
}

/**
 * Hook for multiple storage values
 */
export function useMultipleStorage<T extends StorageKey>(
  keys: readonly T[]
): [
  { [K in T]: StorageValueRecord[K] },
  (updates: Partial<{ [K in T]: StorageValueRecord[K] }>) => void
] {
  const [values, setValues] = useState<{ [K in T]: StorageValueRecord[K] }>(
    () => {
      // Initialize with default values
      const initialValues = {} as { [K in T]: StorageValueRecord[K] }
      keys.forEach((key) => {
        initialValues[key] = STORAGE_DEFAULTS[key]
      })
      return initialValues
    }
  )

  useEffect(() => {
    // Get initial values
    const getInitialValues = async () => {
      const initialValues = {} as { [K in T]: StorageValueRecord[K] }

      await Promise.all(
        keys.map(async (key) => {
          try {
            const value = await storageItems[key].getValue()
            initialValues[key] = (value ??
              STORAGE_DEFAULTS[key]) as StorageValueRecord[typeof key]
          } catch (error) {
            console.warn(`Failed to get initial value for ${key}:`, error)
            initialValues[key] = STORAGE_DEFAULTS[
              key
            ] as StorageValueRecord[typeof key]
          }
        })
      )

      setValues(initialValues)
    }

    getInitialValues()

    // Set up watchers
    const unwatchFunctions = keys.map((key) => {
      return storageItems[key].watch((newValue) => {
        setValues((prev) => ({
          ...prev,
          [key]: newValue ?? STORAGE_DEFAULTS[key]
        }))
      })
    })

    return () => {
      unwatchFunctions.forEach((unwatch) => unwatch())
    }
  }, [keys])

  const updateValues = async (
    updates: Partial<{ [K in T]: StorageValueRecord[K] }>
  ) => {
    const updatePromises = Object.entries(updates).map(([key, value]) => {
      const storageItem = storageItems[key as T]
      return storageItem.setValue(value as never)
    })

    try {
      await Promise.all(updatePromises)
      setValues((prev) => ({ ...prev, ...updates }))
    } catch (error) {
      console.error('Failed to update storage values:', error)
    }
  }

  return [values, updateValues]
}
