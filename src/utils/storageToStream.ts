import { Observable } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'

import type { StorageKey, StorageValueRecord } from '@/storage'
import { storageItems } from '@/storage/storage-items'

/**
 * Convert WXT storage items to RxJS observables
 *
 * This utility creates observables from WXT storage items, allowing reactive
 * programming patterns with browser extension storage.
 *
 * @param key - The storage key to observe
 * @param options - Configuration options
 * @param options.fireImmediately - Whether to emit the current value immediately (default: true)
 * @param options.distinctValues - Whether to filter out duplicate consecutive values (default: true)
 * @returns Observable that emits storage value changes
 */
export function storageToStream<T extends StorageKey>(
  key: T,
  options: {
    fireImmediately?: boolean
    distinctValues?: boolean
  } = {}
): Observable<StorageValueRecord[T]> {
  const { fireImmediately = true, distinctValues = true } = options

  const storage$ = new Observable<StorageValueRecord[T]>((subscriber) => {
    // Emit current value immediately if requested
    if (fireImmediately) {
      storageItems[key]
        .getValue()
        .then((currentValue) => {
          subscriber.next(currentValue as StorageValueRecord[T])
        })
        .catch((error) => {
          subscriber.error(error)
        })
    }

    // Watch for storage changes
    const unsubscribe = storageItems[key].watch((newValue) => {
      subscriber.next(newValue as StorageValueRecord[T])
    })

    // Cleanup function
    return () => {
      unsubscribe()
    }
  })

  // Apply distinct filter if requested
  return distinctValues ? storage$.pipe(distinctUntilChanged()) : storage$
}
