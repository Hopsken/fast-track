/**
 * Background script - Main coordinator
 * This serves as the entry point that initializes all background services
 */

import { defineBackground } from '#imports'

import { registerTicketService } from '~/services/ticket-service'

import { InstallationHandlerService } from './services/installation-handler'
import { OmniboxHandlerService } from './services/omnibox-handler'

export default defineBackground(() => {
  console.log('🚀 Background script initializing...')

  try {
    // Initialize proxy services
    registerTicketService()

    // Initialize other services
    OmniboxHandlerService.initialize()
    InstallationHandlerService.initialize()

    // Set up omnibox default suggestion
    OmniboxHandlerService.setDefaultSuggestion(
      'Search Jira tickets or enter ticket key (e.g., PROJ-123)'
    )

    console.log('✅ Background script initialized successfully')
    console.log('📊 Services status:')
    console.log('  - Ticket Service: Registered via proxy service')
    console.log(
      '  - Extension Version:',
      InstallationHandlerService.getVersion()
    )
  } catch (error) {
    console.error('❌ Background script initialization failed:', error)
  }
})
