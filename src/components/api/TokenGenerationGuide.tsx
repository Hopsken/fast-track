/**
 * Component providing guidance on how to generate a Jira API token
 */

import { useState } from 'react'
import { HiChevronDown, HiChevronRight, HiExternalLink } from 'react-icons/hi'

export function TokenGenerationGuide() {
  const [isExpanded, setIsExpanded] = useState(false)

  const steps = [
    {
      title: "Go to Atlassian Account Settings",
      content: "Visit your Atlassian account security page at id.atlassian.com",
      link: "https://id.atlassian.com/manage-profile/security/api-tokens"
    },
    {
      title: "Create API Token",
      content: "Click 'Create API token' and give it a descriptive label like 'Jira Boost Extension'"
    },
    {
      title: "Copy and Save",
      content: "Copy the generated token immediately and paste it above. You won't be able to see it again!"
    },
    {
      title: "Test Connection",
      content: "Once configured, use the 'Test Connection' button to verify everything works"
    }
  ]

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900">
          How to generate a Jira API token
        </span>
        {isExpanded ? (
          <HiChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <HiChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="space-y-4 mt-4">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {step.content}
                  </p>
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                    >
                      Open Atlassian Security Settings
                      <HiExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="text-yellow-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Security Note
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  API tokens are like passwords. Keep them secure and don't share them. 
                  This extension stores tokens locally in your browser only.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}