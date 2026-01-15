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
      staleTime: minutes(5),
      gcTime: days(1)
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

const queryClientBuster = `${import.meta.env.MODE}-${browser.runtime.getManifest().version}`

const persistOptions: PersistQueryClientProviderProps['persistOptions'] = {
  persister: asyncStoragePersister,
  maxAge: days(2),
  buster: queryClientBuster
}

/**
 * Normy normalizer config
 *
 * - Uses `key` as the normalization key for JiraTicket/IssueDetail objects
 * - Entities are normalized by their unique Jira key (e.g., "PROJ-123")
 * - This enables automatic cache updates across all queries containing the same ticket
 */
const normalizerConfig = {
  getNormalizationObjectKey: (obj: Record<string, unknown>) => {
    // Normalize objects that have a Jira-style key (e.g., "PROJ-123")
    if (typeof obj.key === 'string' && /^[A-Z]+-\d+$/.test(obj.key)) {
      return obj.key
    }
    // Fall back to id for other entities (users, priorities, etc.)
    if (typeof obj.id === 'string') {
      return obj.id
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
