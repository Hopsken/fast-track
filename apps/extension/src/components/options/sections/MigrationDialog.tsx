import { useState, useEffect } from 'react'
import {
  HiXMark as X,
  HiCheck as Check,
  HiBellAlert as AlertTriangle,
  HiArrowPath as RefreshCw,
  HiShieldCheck as Shield
} from 'react-icons/hi2'

import {
  migrationService,
  MigrationStep,
  MigrationStatus
} from '@/lib/jira/oauth-migration'
import { getStorageItem } from '@/lib/storage/schema'

interface MigrationDialogProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function MigrationDialog({
  isOpen,
  onClose,
  onComplete
}: MigrationDialogProps) {
  const [steps, setSteps] = useState<MigrationStep[]>([])
  const [status, setStatus] = useState<MigrationStatus | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [oauthInProgress, setOauthInProgress] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadMigrationData()
    }
  }, [isOpen])

  const loadMigrationData = async () => {
    try {
      setIsLoading(true)
      const [migrationSteps, migrationStatus] = await Promise.all([
        migrationService.getMigrationSteps(),
        migrationService.getMigrationStatus()
      ])

      setSteps(migrationSteps)
      setStatus(migrationStatus)

      // Find current step
      const currentStepIndex = migrationSteps.findIndex(
        (step) => step.status === 'pending' || step.status === 'in_progress'
      )
      setCurrentStep(currentStepIndex >= 0 ? currentStepIndex : 0)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to load migration data'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOAuth = async () => {
    try {
      setOauthInProgress(true)
      setError(null)

      // Get the extension ID for OAuth flow
      const extensionId = chrome.runtime.id
      const baseUrl = await getStorageItem('JiraHost').getValue()

      if (!baseUrl) {
        throw new Error(
          'Jira host not configured. Please set up your Jira host first.'
        )
      }

      // Open OAuth flow in new tab
      const oauthUrl = `${baseUrl}/plugins/servlet/oauth/authorize?oauth_token=temp&extension_id=${extensionId}`

      // Listen for OAuth completion
      const handleOAuthMessage = (message: any) => {
        if (message.type === 'OAUTH_SUCCESS') {
          setOauthInProgress(false)
          loadMigrationData() // Refresh migration status
          chrome.runtime.onMessage.removeListener(handleOAuthMessage)
        } else if (message.type === 'OAUTH_ERROR') {
          setOauthInProgress(false)
          setError(message.error || 'OAuth authentication failed')
          chrome.runtime.onMessage.removeListener(handleOAuthMessage)
        }
      }

      chrome.runtime.onMessage.addListener(handleOAuthMessage)

      // Open OAuth URL
      chrome.tabs.create({ url: oauthUrl })
    } catch (error) {
      setOauthInProgress(false)
      setError(
        error instanceof Error ? error.message : 'Failed to start OAuth flow'
      )
    }
  }

  const handleCompleteMigration = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await migrationService.completeMigration()

      if (result.success) {
        await loadMigrationData()
        onComplete()
      } else {
        setError(result.error || 'Migration completion failed')
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Migration completion failed'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCleanupApiKey = async () => {
    try {
      setIsLoading(true)
      const result = await migrationService.cleanupApiKey()

      if (result.success) {
        await loadMigrationData()
      } else {
        setError(result.error || 'API key cleanup failed')
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'API key cleanup failed'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getStepIcon = (step: MigrationStep) => {
    switch (step.status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'in_progress':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepAction = (step: MigrationStep) => {
    if (step.id === 'oauth_setup' && step.status === 'pending') {
      return (
        <button
          onClick={handleStartOAuth}
          disabled={oauthInProgress}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {oauthInProgress ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Waiting for OAuth...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Start OAuth Setup
            </>
          )}
        </button>
      )
    }

    if (
      step.id === 'test_connection' &&
      step.status === 'pending' &&
      status?.hasOAuthTokens
    ) {
      return (
        <button
          onClick={handleCompleteMigration}
          disabled={isLoading}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Complete Migration
        </button>
      )
    }

    if (
      step.id === 'cleanup_api_key' &&
      step.status === 'pending' &&
      status?.migrationCompleted
    ) {
      return (
        <button
          onClick={handleCleanupApiKey}
          disabled={isLoading}
          className="mt-2 inline-flex items-center gap-2 rounded-md bg-gray-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
          Clean Up API Key
        </button>
      )
    }

    return null
  }

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            OAuth Migration Assistant
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              This assistant will guide you through migrating from API key
              authentication to OAuth. OAuth provides better security and
              eliminates the need to manage API tokens.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`rounded-lg border p-4 ${
                  index === currentStep
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200'
                }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-0.5">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {step.description}
                    </p>

                    {step.error && (
                      <p className="mt-2 text-sm text-red-600">{step.error}</p>
                    )}

                    {getStepAction(step)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {status?.migrationCompleted && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-800">
                  Migration Completed Successfully!
                </p>
              </div>
              <p className="mt-1 text-sm text-green-700">
                Your extension is now using OAuth authentication. You can safely
                close this dialog.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {status?.migrationCompleted ? 'Close' : 'Cancel'}
          </button>

          {!status?.migrationCompleted && (
            <button
              onClick={loadMigrationData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Status
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
