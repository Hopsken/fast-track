'use client'

import { useEffect, useState } from 'react'

import { TokenData } from './type'

interface ExtensionCommunicatorProps {
  tokenData: TokenData
}

// Custom event interfaces for type safety
interface TokenEventData {
  id: string
  timestamp: number
  source: 'page'
  tokenData: TokenData
}

interface ConfirmationEventData {
  id: string
  timestamp: number
  source: 'content_script'
  success: boolean
  message?: string
  error?: string
}

export default function ExtensionCommunicator({
  tokenData
}: ExtensionCommunicatorProps) {
  const [communicationStatus, setCommunicationStatus] = useState<
    'sending' | 'success' | 'error' | 'timeout'
  >('sending')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const generateEventId = () => {
      return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Validate token data before dispatching
    if (!tokenData || !tokenData.access_token || !tokenData.refresh_token) {
      setCommunicationStatus('error')
      setErrorMessage('Invalid token data structure')
      return
    }

    // Dispatch custom event with token data
    const tokenEventData: TokenEventData = {
      id: generateEventId(),
      timestamp: Date.now(),
      source: 'page',
      tokenData
    }

    const tokenEvent = new CustomEvent('jira-oauth-tokens', {
      detail: tokenEventData
    })

    window.dispatchEvent(tokenEvent)

    // Listen for confirmation events from content script
    const handleConfirmationEvent = (event: CustomEvent) => {
      try {
        // Validate event data structure
        if (!event.detail || typeof event.detail !== 'object') {
          return
        }

        const confirmationData = event.detail as ConfirmationEventData

        // Validate confirmation data
        if (
          !confirmationData.timestamp ||
          !confirmationData.source ||
          confirmationData.source !== 'content_script'
        ) {
          return
        }

        setCommunicationStatus(confirmationData.success ? 'success' : 'error')
        if (!confirmationData.success && confirmationData.error) {
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
    window.addEventListener(
      'jira-oauth-confirmation',
      handleConfirmationEvent as EventListener
    )

    // Set timeout for communication
    const timeoutId = setTimeout(() => {
      setCommunicationStatus('timeout')
    }, 10000) // 10 second timeout

    // Cleanup function
    return () => {
      window.removeEventListener(
        'jira-oauth-confirmation',
        handleConfirmationEvent as EventListener
      )
      clearTimeout(timeoutId)
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
      <div className="mt-2 text-sm text-red-600">⚠ Error: {errorMessage}</div>
    )
  }

  if (communicationStatus === 'timeout') {
    return (
      <div className="mt-2 text-sm text-yellow-600">
        ⚠ Extension communication timeout. Tokens may have been received.
        Closing window...
      </div>
    )
  }

  return null
}
