'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'

import { TokenData } from './type'

interface ExtensionCommunicatorProps {
  tokenData: TokenData
}

// Custom event interfaces for type safety
interface TokenEventData {
  source: 'page'
  tokenData: TokenData
}

interface ConfirmationEventData {
  source: 'content_script'
  success: boolean
  message?: string
  error?: string
}

declare global {
  interface WindowEventMap {
    'jira-oauth-tokens': CustomEvent<TokenEventData>
    'jira-oauth-confirmation': CustomEvent<ConfirmationEventData>
  }
}

const tokenDataSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.iso.datetime()
})

export default function ExtensionCommunicator({
  tokenData
}: ExtensionCommunicatorProps) {
  const [communicationStatus, setCommunicationStatus] = useState<
    'sending' | 'success' | 'error' | 'timeout'
  >('sending')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    try {
      tokenDataSchema.parse(tokenData)
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCommunicationStatus('error')
      setErrorMessage('Invalid token data structure')
      return
    }

    // Dispatch custom event with token data
    const tokenEventData: TokenEventData = {
      source: 'page',
      tokenData
    }

    const tokenEvent = new CustomEvent('jira-oauth-tokens', {
      detail: tokenEventData
    })

    window.dispatchEvent(tokenEvent)

    // Listen for confirmation events from content script
    const handleConfirmationEvent = (
      event: CustomEvent<ConfirmationEventData>
    ) => {
      try {
        // Validate event data structure
        if (!event.detail || typeof event.detail !== 'object') {
          return
        }

        const confirmationData = event.detail

        // Validate confirmation data
        if (
          !confirmationData.source ||
          confirmationData.source !== 'content_script'
        ) {
          return
        }

        setCommunicationStatus(confirmationData.success ? 'success' : 'error')
        if (confirmationData.error) {
          setErrorMessage(confirmationData.error)
        }

        // Auto-close window after successful communication
        if (confirmationData.success) {
          setTimeout(() => {
            window.close()
          }, 2000)
        }
      } catch {
        setCommunicationStatus('error')
        setErrorMessage('Error processing confirmation')
      }
    }

    // Add event listener for confirmation events
    window.addEventListener('jira-oauth-confirmation', handleConfirmationEvent)

    // Set timeout for communication
    const timeoutId = setTimeout(() => {
      setCommunicationStatus('timeout')
    }, 10000) // 10 second timeout

    // Cleanup function
    return () => {
      window.removeEventListener(
        'jira-oauth-confirmation',
        handleConfirmationEvent
      )
      window.clearTimeout(timeoutId)
    }
  }, [tokenData])

  // Show status to user (optional - can be removed if you want it invisible)
  if (communicationStatus === 'sending') {
    return (
      <div className="mt-2 text-sm text-gray-600">
        Communicating with extension...
      </div>
    )
  }

  if (communicationStatus === 'success') {
    return (
      <div className="mt-2 text-sm text-green-600">
        ✓ Extension received tokens successfully. Closing window...
      </div>
    )
  }

  if (communicationStatus === 'error') {
    return (
      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <div className="font-medium">Connection failed</div>
        <div className="mt-1 text-amber-800">{errorMessage}</div>
        <div className="mt-2 text-amber-900">
          Having trouble connecting? Switch to API key login.
        </div>
      </div>
    )
  }

  if (communicationStatus === 'timeout') {
    return (
      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <div className="font-medium">Connection may be stuck</div>
        <div className="mt-1 text-amber-800">
          Extension communication timed out.
        </div>
        <div className="mt-2 text-amber-900">
          Having trouble connecting? Switch to API key login.
        </div>
      </div>
    )
  }

  return null
}
