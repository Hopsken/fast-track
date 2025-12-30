import { ticketService } from '@/services'

import { useAsyncValue } from './useAsyncValue'

export function useAuthConfigurationStatus() {
  return useAsyncValue(() => {
    return ticketService.isConfigured()
  }).value
}
