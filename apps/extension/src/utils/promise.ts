import { flatMap } from 'lodash-es'

export async function concatPromises<T>(
  promises: Promise<T[]>[]
): Promise<T[]> {
  const results = await Promise.allSettled(promises)
  return flatMap(results, (result) =>
    result.status === 'fulfilled' ? result.value : []
  )
}
