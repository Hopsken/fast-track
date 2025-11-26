import { useId, useMemo } from 'react'

export function useStableId(providedId: string | undefined, prefix: string) {
  const reactId = useId()

  return useMemo(() => {
    if (providedId) return providedId

    return `${prefix}-${reactId.replace(/[:]/g, '')}`
  }, [prefix, providedId, reactId])
}
