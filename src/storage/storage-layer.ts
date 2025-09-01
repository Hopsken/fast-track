/**
 * Core storage layer implementation
 */

import { WxtStorageItem } from '#imports'

import { StorageKey } from './keys'
import type { StorageValueRecord } from './schema'
import { storageItems } from './storage-items'

/**
 * Storage layer class for type-safe storage operations
 */
export class PersistLayer {
  /**
   * Gets a value from storage
   */
  async get<T extends StorageKey>(key: T): Promise<StorageValueRecord[T]> {
    return (await storageItems[key].getValue()) as StorageValueRecord[T]
  }

  /**
   * Sets a value in storage
   */
  async set<T extends StorageKey>(
    key: T,
    value: StorageValueRecord[T]
  ): Promise<void> {
    // Type-safe storage item access with proper typing
    const storageItem = storageItems[key] as WxtStorageItem<
      StorageValueRecord[T],
      Record<string, unknown>
    >
    return await storageItem.setValue(value)
  }

  /**
   * Removes a value from storage
   */
  async remove<T extends StorageKey>(key: T): Promise<void> {
    return await storageItems[key].removeValue()
  }

  /**
   * Watches for changes to a storage value
   */
  watch<T extends StorageKey>(
    key: T,
    callback: (
      newValue: StorageValueRecord[T] | null,
      oldValue: StorageValueRecord[T] | null
    ) => void
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return storageItems[key].watch(callback as any)
  }

  /**
   * Gets multiple values from storage
   */
  async getMultiple<T extends StorageKey>(
    keys: T[]
  ): Promise<{ [K in T]: StorageValueRecord[K] }> {
    const values = await Promise.all(
      keys.map(async (key) => ({
        key,
        value: await this.get(key)
      }))
    )

    return values.reduce(
      (acc, { key, value }) => {
        acc[key] = value
        return acc
      },
      {} as { [K in T]: StorageValueRecord[K] }
    )
  }

  /**
   * Sets multiple values in storage
   */
  async setMultiple(values: {
    [K in StorageKey]?: StorageValueRecord[K]
  }): Promise<void> {
    const setPromises = Object.entries(values).map(([key, value]) =>
      this.set(key as StorageKey, value as StorageValueRecord[StorageKey])
    )

    await Promise.all(setPromises)
  }

  /**
   * Clears specific storage keys
   */
  async clear(keys: StorageKey[]): Promise<void> {
    const clearPromises = keys.map((key) => this.remove(key))
    await Promise.all(clearPromises)
  }

  /**
   * Gets all values from a specific group
   */
  async getGroup<T extends StorageKey>(
    keys: readonly T[]
  ): Promise<{ [K in T]: StorageValueRecord[K] }> {
    return this.getMultiple([...keys])
  }
}

// Global instance for use throughout the application
export const persistLayer = new PersistLayer()
