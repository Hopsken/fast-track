import { defineContentScript } from '#imports'
import loglevel from 'loglevel'
import { z } from 'zod'

import { getEntitlementService } from '~/services/entitlement-service'

const log = loglevel.getLogger('ExtensionLinkContentScript')
const allowedOrigins = ['https://teamusement.com', 'http://localhost:4000']

loglevel.setDefaultLevel('debug')

interface CodeEventData {
  source: 'page'
  payload: {
    code: string
    expiresAt: string
    extensionId: string
  }
}

interface ConfirmationEventData {
  source: 'content_script'
  success: boolean
  error?: string
}

declare global {
  interface WindowEventMap {
    'ft-extension-link-code': CustomEvent<CodeEventData>
    'ft-extension-link-confirmation': CustomEvent<ConfirmationEventData>
  }
}

export default defineContentScript({
  matches: import.meta.env.DEV
    ? [
        'https://teamusement.com/auth/extension*',
        'http://localhost:4000/auth/extension*'
      ]
    : ['https://teamusement.com/auth/extension*'],
  runAt: 'document_start',
  main() {
    log.debug('Loaded on extension link page')
    initializeLinkCommunication()
  }
})

function initializeLinkCommunication() {
  const entitlementService = getEntitlementService()

  const handleEvent = async (event: CustomEvent<CodeEventData>) => {
    try {
      z.object({
        source: z.literal('page'),
        payload: z.object({
          code: z.string().min(1),
          expiresAt: z.string().min(1),
          extensionId: z.string().min(1)
        })
      }).parse(event.detail)

      const currentOrigin = window.location.origin
      if (!allowedOrigins.includes(currentOrigin)) return

      await entitlementService.receiveLinkCode(event.detail.payload)

      window.dispatchEvent(
        new CustomEvent<ConfirmationEventData>(
          'ft-extension-link-confirmation',
          {
            detail: { source: 'content_script', success: true }
          }
        )
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_error'
      log.error('Linking failed', error)
      window.dispatchEvent(
        new CustomEvent<ConfirmationEventData>(
          'ft-extension-link-confirmation',
          {
            detail: { source: 'content_script', success: false, error: message }
          }
        )
      )
    }
  }

  window.addEventListener('ft-extension-link-code', handleEvent)
}
