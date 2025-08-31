import { useState } from 'react'

import { FormField } from '~/components/ui/forms'
import { useJiraConfig } from '~/hooks/useStorageSettings'

export function ApiConnectionStatus() {
  const { jiraHost, apiToken, userEmail, isConfigComplete } = useJiraConfig()
  const [connectionStatus, setConnectionStatus] = useState<
    'unknown' | 'testing' | 'success' | 'error'
  >('unknown')
  const [statusMessage, setStatusMessage] = useState('')

  const isConfigured = isConfigComplete

  const testConnection = async () => {
    if (!isConfigured) {
      setConnectionStatus('error')
      setStatusMessage('Please configure all required fields first')
      return
    }

    setConnectionStatus('testing')
    setStatusMessage('Testing connection...')

    try {
      const { JiraApiService } = await import('~/lib/jira')
      const apiService = new JiraApiService({
        baseUrl: jiraHost,
        apiToken,
        email: userEmail
      })

      const success = await apiService.testConnection()

      if (success) {
        setConnectionStatus('success')
        setStatusMessage('Connection successful! API integration is working.')
      } else {
        setConnectionStatus('error')
        setStatusMessage('Connection failed. Please check your credentials.')
      }
    } catch (error) {
      setConnectionStatus('error')
      setStatusMessage(
        `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'testing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'testing':
        return '🔄'
      default:
        return isConfigured ? '⚠️' : '❓'
    }
  }

  return (
    <FormField
      size="lg"
      title="Connection Status"
      description="Current status of your Jira API integration">
      <div className="w-full space-y-3">
        <div
          className={`rounded-lg border p-3 text-sm ${getStatusColor()}`}
          role="status"
          aria-live="polite"
          aria-label={`API connection status: ${isConfigured ? 'API Configured' : 'Not Configured'}`}>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">
              {getStatusIcon()}
            </span>
            <span className="font-medium">
              {isConfigured ? 'API Configured' : 'Not Configured'}
            </span>
          </div>
          {statusMessage && (
            <div className="text-xs opacity-80">{statusMessage}</div>
          )}
        </div>

        <button
          onClick={testConnection}
          disabled={!isConfigured || connectionStatus === 'testing'}
          className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isConfigured && connectionStatus !== 'testing'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-200 text-gray-500'
          }`}
          aria-label={`Test API connection ${connectionStatus === 'testing' ? '- testing in progress' : ''}`}>
          {connectionStatus === 'testing'
            ? 'Testing Connection...'
            : 'Test Connection'}
        </button>
      </div>
    </FormField>
  )
}
