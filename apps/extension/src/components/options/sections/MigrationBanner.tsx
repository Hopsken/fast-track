import { useState, useEffect } from 'react'
import { HiShieldCheck, HiX, HiArrowRight, HiClock } from 'react-icons/hi'

import { migrationService, MigrationStatus } from '@/lib/jira/oauth-migration'

interface MigrationBannerProps {
  onStartMigration: () => void
}

export function MigrationBanner({ onStartMigration }: MigrationBannerProps) {
  const [migrationStatus, setMigrationStatus] =
    useState<MigrationStatus | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkMigrationStatus()
  }, [])

  const checkMigrationStatus = async () => {
    try {
      setIsLoading(true)
      const [status, shouldPrompt] = await Promise.all([
        migrationService.getMigrationStatus(),
        migrationService.shouldPromptMigration()
      ])

      setMigrationStatus(status)
      setIsVisible(shouldPrompt)
    } catch (error) {
      console.error('Failed to check migration status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = async () => {
    await migrationService.dismissMigrationPrompt(7) // Dismiss for 7 days
    setIsVisible(false)
  }

  const handleRemindLater = async () => {
    await migrationService.dismissMigrationPrompt(1) // Dismiss for 1 day
    setIsVisible(false)
  }

  if (isLoading || !isVisible || !migrationStatus?.isRequired) {
    return null
  }

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <HiShieldCheck className="h-6 w-6 text-amber-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800">
            🚀 Upgrade to OAuth Authentication
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            Switch to OAuth for enhanced security and better user experience.
            OAuth eliminates the need to manage API tokens and provides more
            secure access to your Jira data.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onStartMigration}
              className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none">
              Start Migration
              <HiArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleRemindLater}
              className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none">
              <HiClock className="h-4 w-4" />
              Remind Tomorrow
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-md p-1 text-amber-400 hover:text-amber-600 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          aria-label="Dismiss migration banner">
          <HiX className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 border-t border-amber-200 pt-3">
        <div className="flex items-center gap-4 text-xs text-amber-600">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            <span>More Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-blue-400"></div>
            <span>No Token Management</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-purple-400"></div>
            <span>Better User Experience</span>
          </div>
        </div>
      </div>
    </div>
  )
}
