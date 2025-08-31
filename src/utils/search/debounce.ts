import { debounce } from 'lodash-es'

/**
 * Search-specific debounce with smart delays based on query length
 */
export function debounceSearch<
  T extends (query: string, ...args: any[]) => any
>(func: T, baseWait: number = 300) {
  return debounce(func, baseWait, {
    leading: false,
    trailing: true
  })
}
