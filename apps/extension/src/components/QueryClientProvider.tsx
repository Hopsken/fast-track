import { browser } from '#imports'
import { PropsWithChildren } from 'react'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

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
    getItem: browser.storage.local.get,
    setItem: (key, value) => browser.storage.local.set({ [key]: value }),
    removeItem: browser.storage.local.remove
  }
})

export const QueryClientProvider = ({ children }: PropsWithChildren) => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister: asyncStoragePersister }}>
    {children}
  </PersistQueryClientProvider>
)
