/**
 * Component for Jira host URL input with validation
 */

import { useState, useEffect } from 'react'
import { HiGlobeAlt, HiCheck, HiX } from 'react-icons/hi'
import { useJiraConfig } from '~/hooks/storage/useSettings'
import { isValidJiraUrl, normalizeJiraUrl, extractJiraInstanceName } from '~/lib/jira'

export function JiraHostInput() {
  const { jiraHost, updateJiraConfig } = useJiraConfig()
  const [inputValue, setInputValue] = useState(jiraHost)
  const [isValid, setIsValid] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    setInputValue(jiraHost)
  }, [jiraHost])

  useEffect(() => {
    const valid = isValidJiraUrl(inputValue)
    setIsValid(valid)
    setShowValidation(inputValue.length > 0)
  }, [inputValue])

  const handleSave = () => {
    if (isValid) {
      const normalizedUrl = normalizeJiraUrl(inputValue)
      updateJiraConfig({ host: normalizedUrl })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSave()
    }
  }

  const getValidationIcon = () => {
    if (!showValidation) return null
    return isValid 
      ? <HiCheck className="w-5 h-5 text-green-500" />
      : <HiX className="w-5 h-5 text-red-500" />
  }

  const getInstanceName = () => {
    if (!isValid) return null
    return extractJiraInstanceName(inputValue)
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="jira-host" className="block text-sm font-medium text-gray-700 mb-2">
          Jira URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiGlobeAlt className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="jira-host"
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://your-domain.atlassian.net"
            className={`block w-full pl-10 pr-12 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              showValidation
                ? isValid
                  ? 'border-green-300 bg-green-50'
                  : 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {getValidationIcon()}
          </div>
        </div>
      </div>

      {showValidation && (
        <div className="space-y-2">
          {isValid ? (
            <div className="text-sm text-green-600">
              <div className="flex items-center gap-2">
                <HiCheck className="w-4 h-4" />
                <span>Valid Jira URL</span>
              </div>
              {getInstanceName() && (
                <p className="text-xs text-gray-600 mt-1">
                  Instance: <span className="font-mono">{getInstanceName()}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-600">
              <div className="flex items-center gap-2">
                <HiX className="w-4 h-4" />
                <span>Please enter a valid Jira URL</span>
              </div>
              <p className="text-xs mt-1">
                Example: https://your-company.atlassian.net
              </p>
            </div>
          )}

          {isValid && inputValue !== jiraHost && (
            <button
              onClick={handleSave}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Save URL
            </button>
          )}
        </div>
      )}
    </div>
  )
}