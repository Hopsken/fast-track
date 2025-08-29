import { useState } from "react"
import { FieldControl } from "~/components/ui/forms"

export function TokenGenerationGuide() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <FieldControl
      size="lg"
      title="How to Generate API Token"
      description="Step-by-step guide to create your Atlassian API token"
    >
      <div className="w-full">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-between"
        >
          <span>Show Setup Instructions</span>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </button>

        {isExpanded && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm space-y-4">
            <div className="space-y-3">
              <div className="font-medium text-gray-800">📝 Generate Your API Token:</div>
              
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  Go to{' '}
                  <a 
                    href="https://id.atlassian.com/manage-profile/security/api-tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Atlassian Account Settings
                  </a>
                </li>
                <li>Click "Create API token"</li>
                <li>Enter a label (e.g., "Jira Boost Extension")</li>
                <li>Click "Create"</li>
                <li>Copy the token immediately (you won't see it again!)</li>
                <li>Paste it in the "API Token" field above</li>
              </ol>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="font-medium text-gray-800">🔐 Security Best Practices:</div>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4 text-xs">
                <li>Store your token securely (like a password)</li>
                <li>Never share your token with others</li>
                <li>Revoke unused tokens in your Atlassian account</li>
                <li>Your token works only with your Jira instance</li>
              </ul>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="font-medium text-gray-800">✨ Benefits of API Integration:</div>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4 text-xs">
                <li>More reliable than web scraping</li>
                <li>Access to all issue fields and metadata</li>
                <li>Faster data collection</li>
                <li>Works even when Jira UI changes</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </FieldControl>
  )
}