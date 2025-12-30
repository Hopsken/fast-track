import { browser } from '#imports'
import { PropsWithChildren } from 'react'
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

const persistOptions: PersistQueryClientProviderProps['persistOptions'] = {
  persister: asyncStoragePersister,
  maxAge: days(2)
}

export const QueryClientProvider = ({ children }: PropsWithChildren) => (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={persistOptions}>
    {children}

    <ReactQueryDevtools />
  </PersistQueryClientProvider>
)
