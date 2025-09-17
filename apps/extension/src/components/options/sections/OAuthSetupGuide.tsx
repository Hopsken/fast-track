import React from 'react'
import {
  HiShieldCheck as Shield,
  HiBolt as Zap,
  HiArrowPath as RefreshCw,
  HiOutlineKey,
  HiOutlineExclamationTriangle
} from 'react-icons/hi2'

import { OAuth } from '@/lib/jira/oauth-flow'

interface OAuthSetupGuideProps {
  onStartOAuth: () => void
}

export const OAuthSetupGuide: React.FC<OAuthSetupGuideProps> = ({
  onStartOAuth
}) => {
  const handleStartOAuth = async () => {
    try {
      const result = await OAuth.start()
      if (!result.success) {
        console.error('Failed to start OAuth flow:', result.error)
      }
      onStartOAuth()
    } catch (error) {
      console.error('Failed to start OAuth flow:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Benefits Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <Shield className="text-success h-5 w-5" />
            OAuth Authentication
          </h2>
          <p className="text-base-content/70">
            Secure authentication through the Jira Boost website - no passwords
            or API keys needed
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Shield className="text-success h-4 w-4" />
              <span className="text-sm font-medium">Secure & Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="text-info h-4 w-4" />
              <span className="text-sm font-medium">Fast Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="text-secondary h-4 w-4" />
              <span className="text-sm font-medium">Auto-Refresh</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">How OAuth Works</h2>
          <p className="text-base-content/70 mb-4">
            Simple 3-step authentication process using the secure Jira Boost
            website
          </p>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                  1
                </div>
              </div>
              <div>
                <p className="text-sm">
                  <strong>Click the button below</strong> - Opens the Jira Boost
                  authentication page
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                  2
                </div>
              </div>
              <div>
                <p className="text-sm">
                  <strong>Authenticate with Jira</strong> - Log in to your Jira
                  account on the secure website
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                  3
                </div>
              </div>
              <div>
                <p className="text-sm">
                  <strong>Return to extension</strong> - You'll be automatically
                  redirected back here
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleStartOAuth}
              className="btn btn-primary w-full">
              <HiOutlineKey className="mr-2 h-4 w-4" />
              Start OAuth Authentication
            </button>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <HiOutlineExclamationTriangle className="text-warning h-5 w-5" />
            Troubleshooting
          </h2>
          <div className="space-y-3">
            <p className="text-base-content/70 text-sm">
              If authentication doesn't work:
            </p>
            <ul className="text-base-content/70 ml-4 space-y-1 text-sm">
              <li>
                • <strong>Disable popup blockers</strong> for this extension
              </li>
              <li>• Make sure you're logged into your Jira account</li>
              <li>• Try refreshing the page and clicking the button again</li>
              <li>• Check that your Jira instance is accessible</li>
            </ul>
            <div className="bg-success/10 border-success/20 mt-4 rounded-md border p-3">
              <p className="text-success text-sm">
                <strong>✓ Secure:</strong> Your credentials are never stored in
                the extension. Authentication happens entirely through the
                official Jira Boost website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
