/**
 * Background script - Main coordinator
 * This serves as the entry point that initializes all background services
 */

import { defineBackground } from '#imports'

import { registerSearchService } from '@/services/search-service'
import { registerAuthService } from '~/services/auth-service'
import { registerJiraService } from '~/services/jira-service'
import { registerTicketService } from '~/services/ticket-service'
import { getLogger } from '~/utils/logger'

import { InstallationHandlerService } from './services/installation-handler'
import { OmniboxHandlerService } from './services/omnibox-handler'

const log = getLogger('background')

export default defineBackground(() => {
  log.info('🚀 Background script initializing...')

  // Initialize proxy services
  registerJiraService()
  registerTicketService()
  registerSearchService()
  registerAuthService()

  // Initialize alarms service

  // Initialize other services
  OmniboxHandlerService.initialize()
  OmniboxHandlerService.setDefaultSuggestion(
    'Jump to a ticket key (PROJ-123) or search Jira'
  )

  InstallationHandlerService.initialize()

  log.info('✅ Background script initialized successfully')
  log.info('  - Extension Version:', InstallationHandlerService.getVersion())
})
