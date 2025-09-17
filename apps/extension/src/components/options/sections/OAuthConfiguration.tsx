import { useState, useEffect } from 'react'
import {
  HiShieldCheck as Shield,
  HiUser as User,
  HiClock as Clock,
  HiArrowPath as RefreshCw,
  HiBellAlert as AlertTriangle
} from 'react-icons/hi2'

import { oauthManager } from '@/lib/jira/oauth-manager'
import { OAuthUserInfo } from '@/lib/storage/schema'

import { OAuthSetupGuide } from './OAuthSetupGuide'

interface OAuthConfigurationProps {
  onSwitchToApiKey?: () => void
}

export function OAuthConfiguration({
  onSwitchToApiKey
}: OAuthConfigurationProps) {
  const [tokens, setTokens] = useState<{
    access_token: string
    refresh_token: string
    expires_at: string
  } | null>(null)
  const [userInfo, setUserInfo] = useState<OAuthUserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null)

  useEffect(() => {
    loadOAuthData()
  }, [])

  const loadOAuthData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [oauthTokens, oauthUserInfo] = await Promise.all([
        oauthManager.getTokens(),
        oauthManager.getUserInfo()
      ])

      setTokens(oauthTokens)
      setUserInfo(oauthUserInfo)

      if (oauthTokens) {
        // Calculate token expiry
        const expiryTime = new Date(oauthTokens.expires_at)
        setTokenExpiry(expiryTime)
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to load OAuth data'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshToken = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      const result = await oauthManager.refreshTokens()

      if (result) {
        await loadOAuthData()
      } else {
        setError('Failed to refresh token')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Token refresh failed')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRevokeOAuth = async () => {
    if (
      !confirm(
        'Are you sure you want to revoke OAuth access? You will need to re-authenticate.'
      )
    ) {
      return
    }

    try {
      setIsLoading(true)
      await oauthManager.clearTokens()

      if (onSwitchToApiKey) {
        onSwitchToApiKey()
      }

      await loadOAuthData()
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to revoke OAuth access'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const isTokenExpired = () => {
    if (!tokenExpiry) return false
    return new Date() > tokenExpiry
  }

  const getTokenExpiryStatus = () => {
    if (!tokenExpiry) return null

    const now = new Date()
    const timeDiff = tokenExpiry.getTime() - now.getTime()
    const hoursUntilExpiry = Math.floor(timeDiff / (1000 * 60 * 60))

    if (timeDiff <= 0) {
      return { status: 'expired', message: 'Token has expired', color: 'red' }
    } else if (hoursUntilExpiry <= 24) {
      return {
        status: 'expiring',
        message: `Expires in ${hoursUntilExpiry} hours`,
        color: 'amber'
      }
    } else {
      const daysUntilExpiry = Math.floor(hoursUntilExpiry / 24)
      return {
        status: 'valid',
        message: `Expires in ${daysUntilExpiry} days`,
        color: 'green'
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-10 rounded bg-gray-200"></div>
        </div>
      </div>
    )
  }

  if (!tokens) {
    return (
      <OAuthSetupGuide
        onStartOAuth={() => {
          // Refresh the component state after OAuth flow
          loadOAuthData()
        }}
      />
    )
  }

  const expiryStatus = getTokenExpiryStatus()

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* OAuth Status */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
          <div className="flex-1">
            <h3 className="font-medium text-green-800">
              OAuth Authentication Active
            </h3>
            <p className="mt-1 text-sm text-green-700">
              Your extension is securely connected to Jira using OAuth
              authentication.
            </p>
          </div>
        </div>
      </div>

      {/* User Information */}
      {userInfo && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Connected Account
          </label>
          <div className="rounded-md border border-gray-300 bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {userInfo.display_name}
                </p>
                <p className="text-xs text-gray-500">{userInfo.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Token Status */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Token Status
        </label>
        <div className="space-y-3">
          {expiryStatus && (
            <div
              className={`rounded-md border p-3 ${
                expiryStatus.color === 'red'
                  ? 'border-red-200 bg-red-50'
                  : expiryStatus.color === 'amber'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-green-200 bg-green-50'
              }`}>
              <div className="flex items-center gap-2">
                <Clock
                  className={`h-5 w-5 ${
                    expiryStatus.color === 'red'
                      ? 'text-red-600'
                      : expiryStatus.color === 'amber'
                        ? 'text-amber-600'
                        : 'text-green-600'
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    expiryStatus.color === 'red'
                      ? 'text-red-800'
                      : expiryStatus.color === 'amber'
                        ? 'text-amber-800'
                        : 'text-green-800'
                  }`}>
                  {expiryStatus.message}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleRefreshToken}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
            </button>

            <button
              onClick={handleRevokeOAuth}
              className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
              Revoke Access
            </button>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="flex items-start gap-2">
          <div className="text-blue-600">
            <svg
              className="mt-0.5 h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-sm text-blue-700">
            <p className="mb-1 font-medium">Enhanced Security</p>
            <p>
              OAuth tokens are encrypted and stored locally. They automatically
              refresh and provide secure access without exposing your
              credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
