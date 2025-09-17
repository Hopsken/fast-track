/**
 * Background script - Main coordinator
 * This serves as the entry point that initializes all background services
 */

import { defineBackground } from '#imports'

import { getJiraApi } from '@/lib/jira'
import { getDatabase } from '@/repository'
import { registerSearchService } from '@/services/search-service'
import { registerTicketService } from '~/services/ticket-service'

import { BackgroundAlarmsService } from './services/background-alarms'
import { InstallationHandlerService } from './services/installation-handler'
import { OAuthBackgroundService } from './services/oauth-background-service'
import { OmniboxHandlerService } from './services/omnibox-handler'

export default defineBackground(() => {
  console.log('🚀 Background script initializing...')

  try {
    getDatabase()
      .then((database) => {
        console.log('✅ RxDB initialized successfully')

        // Initialize proxy services
        const ticketService = registerTicketService(getJiraApi(), database)
        registerSearchService(database)

        // Initialize alarms service
        const alarmsService = new BackgroundAlarmsService(ticketService)

        // Initialize OAuth background service
        const oauthService = new OAuthBackgroundService()

        return Promise.all([
          alarmsService.initialize(),
          oauthService.initialize()
        ])
      })
      .catch((error) => {
        console.error('❌ RxDB initialization failed:', error)
      })

    // Initialize other services
    OmniboxHandlerService.initialize()
    OmniboxHandlerService.setDefaultSuggestion(
      'Search Jira tickets or enter ticket key (e.g., PROJ-123)'
    )

    InstallationHandlerService.initialize()

    console.log('✅ Background script initialized successfully')
    console.log('📊 Services status:')
    console.log('  - Ticket Service: Registered via proxy service')
    console.log('  - Ticket Collection: Messaging service active')
    console.log('  - OAuth Background Service: Token refresh monitoring active')
    console.log(
      '  - Extension Version:',
      InstallationHandlerService.getVersion()
    )
  } catch (error) {
    console.error('❌ Background script initialization failed:', error)
  }
})
