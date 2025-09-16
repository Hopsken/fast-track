import { flatMap } from 'lodash-es'

export function concatPromises<T>(promises: Promise<T[]>[]): Promise<T[]> {
  return Promise.allSettled(promises).then((results) =>
    flatMap(results, (result) =>
      result.status === 'fulfilled' ? result.value : []
    )
  )
}
