/**
 * Main storage hook for React components
 */

import { useState, useEffect } from 'react'
import { storageItems } from '~/storage/storage-items'
import { StorageKey } from '~/storage/keys'
import type { StorageValueRecord } from '~/storage/schema'

/**
 * React hook for accessing WXT storage with automatic updates
 */
export function useStorage<T extends StorageKey>(
  key: T,
  defaultValue?: StorageValueRecord[T]
): [StorageValueRecord[T], (value: StorageValueRecord[T]) => void] {
  const [value, setValue] = useState<StorageValueRecord[T]>(defaultValue as StorageValueRecord[T])

  useEffect(() => {
    // Get initial value safely
    const storageItem = storageItems[key]
    
    if (storageItem) {
      storageItem.getValue()
        .then(setValue)
        .catch((error) => {
          console.warn(`Failed to get storage value for key ${key}:`, error)
          if (defaultValue !== undefined) {
            setValue(defaultValue)
          }
        })
      
      // Watch for changes
      const unwatch = storageItem.watch((newValue) => {
        if (newValue !== null) {
          setValue(newValue)
        }
      })

      return unwatch
    } else {
      console.warn(`Storage item not found for key: ${key}`)
      if (defaultValue !== undefined) {
        setValue(defaultValue)
      }
    }
  }, [key, defaultValue])

  const setStorageValue = (newValue: StorageValueRecord[T]) => {
    const storageItem = storageItems[key]
    
    if (storageItem) {
      storageItem.setValue(newValue)
        .then(() => setValue(newValue))
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
  keys: T[]
): [{ [K in T]: StorageValueRecord[K] }, (updates: Partial<{ [K in T]: StorageValueRecord[K] }>) => void] {
  const [values, setValues] = useState<{ [K in T]: StorageValueRecord[K] }>({} as any)

  useEffect(() => {
    // Get initial values
    const getInitialValues = async () => {
      const initialValues = {} as { [K in T]: StorageValueRecord[K] }
      
      await Promise.all(
        keys.map(async (key) => {
          try {
            const value = await storageItems[key].getValue()
            initialValues[key] = value
          } catch (error) {
            console.warn(`Failed to get initial value for ${key}:`, error)
          }
        })
      )
      
      setValues(initialValues)
    }

    getInitialValues()

    // Set up watchers
    const unwatchers = keys.map(key => {
      return storageItems[key].watch((newValue) => {
        if (newValue !== null) {
          setValues(prev => ({ ...prev, [key]: newValue }))
        }
      })
    })

    return () => {
      unwatchers.forEach(unwatch => unwatch())
    }
  }, [keys])

  const updateValues = async (updates: Partial<{ [K in T]: StorageValueRecord[K] }>) => {
    const updatePromises = Object.entries(updates).map(([key, value]) =>
      storageItems[key as T].setValue(value as any)
    )

    try {
      await Promise.all(updatePromises)
      setValues(prev => ({ ...prev, ...updates }))
    } catch (error) {
      console.error('Failed to update storage values:', error)
    }
  }

  return [values, updateValues]
}