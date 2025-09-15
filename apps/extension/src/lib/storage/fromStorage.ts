import { isEqual } from 'lodash-es'
import {
  catchError,
  concat,
  distinctUntilChanged,
  from,
  Observable,
  shareReplay,
  throwError
} from 'rxjs'

import { getStorageItem, StorageKey, StorageValue } from './schema'

const storageStreams = new Map<
  StorageKey,
  Observable<StorageValue<StorageKey>>
>()

export const fromStorage$ = <T extends StorageKey>(
  key: T
): Observable<StorageValue<T>> => {
  const cached = storageStreams.get(key)
  if (cached) return cached as Observable<StorageValue<T>>

  const item = getStorageItem(key)

  const changes$ = new Observable<StorageValue<T>>((subscriber) => {
    const unwatch = item.watch((next) => subscriber.next(next))
    return () => unwatch()
  })

  const initial$ = from(item.getValue()).pipe(
    catchError((err) => throwError(() => err))
  )

  const shared$ = concat(initial$, changes$).pipe(
    distinctUntilChanged(isEqual),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  storageStreams.set(
    key,
    shared$ as unknown as Observable<StorageValue<StorageKey>>
  )

  return shared$
}
