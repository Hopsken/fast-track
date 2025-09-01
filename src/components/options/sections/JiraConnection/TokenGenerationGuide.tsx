import { useState } from 'react'

import { FormField } from '~/components/ui/forms'

export function TokenGenerationGuide() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <FormField
      size="lg"
      title="How to Generate API Token"
      description="Step-by-step guide to create your Atlassian API token">
      <div className="w-full">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-100"
          aria-expanded={isExpanded}
          aria-controls="token-generation-instructions"
          aria-label={`${isExpanded ? 'Hide' : 'Show'} API token setup instructions`}>
          <span>Show Setup Instructions</span>
          <span
            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden="true">
            ↓
          </span>
        </button>

        {isExpanded && (
          <div
            className="mt-4 space-y-4 rounded-lg bg-gray-50 p-4 text-sm"
            id="token-generation-instructions"
            role="region"
            aria-labelledby="token-generation-guide-title">
            <div className="space-y-3">
              <div
                className="font-medium text-gray-800"
                id="token-generation-guide-title">
                📝 Generate Your API Token:
              </div>

              <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-700">
                <li>
                  Go to{' '}
                  <a
                    href="https://id.atlassian.com/manage-profile/security/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800">
                    Atlassian Account Settings
                  </a>
                </li>
                <li>{'Click "Create API token"'}</li>
                <li>{'Enter a label (e.g., "Jira Boost Extension")'}</li>
                <li>{'Click "Create"'}</li>
                <li>
                  {'Copy the token immediately (you won&apos;t see it again!)'}
                </li>
                <li>{'Paste it in the "API Token" field above'}</li>
              </ol>
            </div>

            <div className="space-y-2 border-t pt-3">
              <div className="font-medium text-gray-800">
                🔐 Security Best Practices:
              </div>
              <ul className="ml-4 list-inside list-disc space-y-1 text-xs text-gray-600">
                <li>Store your token securely (like a password)</li>
                <li>Never share your token with others</li>
                <li>Revoke unused tokens in your Atlassian account</li>
                <li>Your token works only with your Jira instance</li>
              </ul>
            </div>

            <div className="space-y-2 border-t pt-3">
              <div className="font-medium text-gray-800">
                ✨ Benefits of API Integration:
              </div>
              <ul className="ml-4 list-inside list-disc space-y-1 text-xs text-gray-600">
                <li>More reliable than web scraping</li>
                <li>Access to all issue fields and metadata</li>
                <li>Faster data collection</li>
                <li>Works even when Jira UI changes</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </FormField>
  )
}
