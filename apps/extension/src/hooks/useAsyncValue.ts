import { useEffect, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading'; value: undefined }
  | { status: 'success'; value: T }
  | { status: 'error'; value: undefined }

export function useAsyncValue<T>(fn: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'loading',
    value: undefined
  })

  useEffect(() => {
    fn()
      .then((value) => setState({ status: 'success', value }))
      .catch(() => setState({ status: 'error', value: undefined }))
  }, [fn])

  return state
}
