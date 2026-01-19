import { useState, useEffect } from 'react'

import { getStorageItem, StorageKey, StorageValue } from '@/lib/storage'
import { getLogger } from '~/utils/logger'

const log = getLogger('storage-hook')

type State<T extends StorageKey> = {
  state: 'pending' | 'success' | 'error'
  value: StorageValue<T>
}

/**
 * React hook for accessing WXT storage with automatic updates
 */
export function useStorage<T extends StorageKey>(
  key: T
): [
  StorageValue<T>,
  (
    value: StorageValue<T> | ((prev: StorageValue<T>) => StorageValue<T>)
  ) => void,
  State<T>['state']
] {
  const [storageItem] = useState(getStorageItem(key))
  const [value, setValue] = useState<State<T>>({
    state: 'pending',
    value: storageItem.fallback
  })

  useEffect(() => {
    storageItem
      .getValue()
      .then((storageValue) => {
        setValue({ state: 'success', value: storageValue })
      })
      .catch((error) => {
        log.warn(
          `Failed to get storage value for key ${storageItem.key}:`,
          error
        )
        setValue({ state: 'error', value: storageItem.fallback })
      })

    // Watch for changes
    return storageItem.watch((newValue) => {
      setValue({ state: 'success', value: newValue })
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
        ? (newValue as (prev: StorageValue<T>) => StorageValue<T>)(value.value)
        : newValue

    storageItem
      .setValue(finalValue)
      .then(() => setValue({ state: 'success', value: finalValue }))
      .catch((error) => {
        log.error(`Failed to set storage value for key ${key}:`, error)
      })
  }

  return [value.value, setStorageValue, value.state]
}
