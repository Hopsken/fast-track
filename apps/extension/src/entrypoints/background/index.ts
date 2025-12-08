/**
 * Background script - Main coordinator
 * This serves as the entry point that initializes all background services
 */

import { defineBackground } from '#imports'

import { getDatabase } from '@/repository'
import { registerSearchService } from '@/services/search-service'
import { registerAuthService } from '~/services/auth-service'
import { registerJiraService } from '~/services/jira-service'
import { registerTicketService } from '~/services/ticket-service'
import { getLogger } from '~/utils/logger'

import { BackgroundAlarmsService } from './services/background-alarms'
import { InstallationHandlerService } from './services/installation-handler'
import { OmniboxHandlerService } from './services/omnibox-handler'

const log = getLogger('background')

export default defineBackground(() => {
  log.info('🚀 Background script initializing...')

  getDatabase()
    .then((database) => {
      log.info('✅ RxDB initialized successfully')

      // Initialize proxy services
      registerJiraService()
      const ticketService = registerTicketService(database)
      registerSearchService(database)
      registerAuthService(database)

      // Initialize alarms service
      const alarmsService = new BackgroundAlarmsService(ticketService)
      return Promise.all([alarmsService.initialize()])
    })
    .catch((error) => {
      log.error('❌ RxDB initialization failed:', error)
    })

  // Initialize other services
  OmniboxHandlerService.initialize()
  OmniboxHandlerService.setDefaultSuggestion(
    'Search Jira tickets or enter ticket key (e.g., PROJ-123)'
  )

  InstallationHandlerService.initialize()

  log.info('✅ Background script initialized successfully')
  log.info('📊 Services status:')
  log.info('  - Ticket Service: Registered via proxy service')
  log.info('  - Ticket Collection: Messaging service active')
  log.info('  - OAuth Background Service: Token refresh monitoring active')
  log.info('  - Extension Version:', InstallationHandlerService.getVersion())
})
