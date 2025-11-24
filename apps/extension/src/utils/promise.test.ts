import { describe, expect, it } from 'vitest'

import { concatPromises } from './promise'

describe('concatPromises', () => {
  it('combines fulfilled promise results and ignores rejections', async () => {
    const result = await concatPromises([
      Promise.resolve([1]),
      Promise.reject(new Error('fail')),
      Promise.resolve([2, 3])
    ])

    expect(result).toEqual([1, 2, 3])
  })
})
