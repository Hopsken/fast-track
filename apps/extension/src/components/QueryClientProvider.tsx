import { browser } from '#imports'
import { PropsWithChildren } from 'react'
import { QueryNormalizerProvider } from '@normy/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  PersistQueryClientProvider,
  PersistQueryClientProviderProps
} from '@tanstack/react-query-persist-client'

import { days, minutes } from '@/utils/time'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: minutes(5)
    }
  }
})

const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => {
      const item = await browser.storage.local.get(key)
      return item?.[key]
    },
    setItem: (key, value) => browser.storage.local.set({ [key]: value }),
    removeItem: (key) => browser.storage.local.remove(key)
  }
})

// eslint-disable-next-line turbo/no-undeclared-env-vars
const queryClientBuster = `${import.meta.env.MODE}-${browser.runtime.getManifest().version}`

const persistOptions: PersistQueryClientProviderProps['persistOptions'] = {
  persister: asyncStoragePersister,
  maxAge: days(2),
  buster: queryClientBuster
}

/**
 * Normy normalizer config (GraphQL-style)
 *
 * Uses `__typename` + `key` or `id` for normalization keys.
 * Example: "JiraIssue:PROJ-123"
 *
 * This enables automatic cache updates across all queries containing the same entity.
 */
const normalizerConfig = {
  getNormalizationObjectKey: (obj: Record<string, unknown>) => {
    const typename = obj.__typename as string | undefined
    const id = obj.id
    const hasValidId = typeof id === 'string' || typeof id === 'number'

    // GraphQL-style: __typename + key (for JiraIssue)
    if (typename && typeof obj.key === 'string') {
      return `${typename}:${obj.key}`
    }

    // GraphQL-style: __typename + id (for other entities)
    if (typename && hasValidId) {
      return `${typename}:${id}`
    }

    return undefined
  }
}

export const QueryClientProvider = ({ children }: PropsWithChildren) => (
  <QueryNormalizerProvider
    queryClient={queryClient}
    normalizerConfig={normalizerConfig}>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}>
      {children}
      <ReactQueryDevtools />
    </PersistQueryClientProvider>
  </QueryNormalizerProvider>
)
