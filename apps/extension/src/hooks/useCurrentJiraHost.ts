import { useMemo } from 'react'

import { normalizeBaseUrlHost } from '~/utils/normalize-host'

import { useStorage } from './useStorage'

export function useCurrentJiraHost() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/no-unused-vars
  const [credentials, _, state] = useStorage('AuthCredentials')

  const data = useMemo(() => {
    const host = credentials?.host
    return host ? normalizeBaseUrlHost(host) : null
  }, [credentials])

  return {
    data,
    isLoading: state === 'pending'
  }
}
