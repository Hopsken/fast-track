import { DependencyList, useEffect, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading'; value: undefined }
  | { status: 'success'; value: T }
  | { status: 'error'; value: undefined }

export function useAsyncValue<T>(fn: () => Promise<T>, deps?: DependencyList) {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'loading',
    value: undefined
  })

  useEffect(() => {
    fn()
      .then((value) => setState({ status: 'success', value }))
      .catch(() => setState({ status: 'error', value: undefined }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps ?? [])

  return state
}
