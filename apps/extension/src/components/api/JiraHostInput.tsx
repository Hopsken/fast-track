/**
 * Component for Jira host URL input with validation
 */

import { useState, useEffect, KeyboardEvent } from 'react'
import { HiGlobeAlt, HiCheck, HiX } from 'react-icons/hi'

import { useJiraConfig } from '@/hooks/useJiraConfig'
import {
  isValidJiraUrl,
  normalizeJiraUrl,
  extractJiraInstanceName
} from '@/utils/jira/url-helpers'

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
      updateJiraConfig({ JiraHost: normalizedUrl })
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSave()
    }
  }

  const getValidationIcon = () => {
    if (!showValidation) return null
    return isValid ? (
      <HiCheck className="h-5 w-5 text-green-500" />
    ) : (
      <HiX className="h-5 w-5 text-red-500" />
    )
  }

  const getInstanceName = () => {
    if (!isValid) return null
    return extractJiraInstanceName(inputValue)
  }

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="jira-host"
          className="mb-2 block text-sm font-medium text-gray-700">
          Jira URL
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <HiGlobeAlt className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="jira-host"
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://your-domain.atlassian.net"
            className={`block w-full rounded-md border py-2 pr-12 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              showValidation
                ? isValid
                  ? 'border-green-300 bg-green-50'
                  : 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {getValidationIcon()}
          </div>
        </div>
      </div>

      {showValidation && (
        <div className="space-y-2">
          {isValid ? (
            <div className="text-sm text-green-600">
              <div className="flex items-center gap-2">
                <HiCheck className="h-4 w-4" />
                <span>Valid Jira URL</span>
              </div>
              {getInstanceName() && (
                <p className="mt-1 text-xs text-gray-600">
                  Instance:{' '}
                  <span className="font-mono">{getInstanceName()}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-600">
              <div className="flex items-center gap-2">
                <HiX className="h-4 w-4" />
                <span>Please enter a valid Jira URL</span>
              </div>
              <p className="mt-1 text-xs">
                Example: https://your-company.atlassian.net
              </p>
            </div>
          )}

          {isValid && inputValue !== jiraHost && (
            <button
              onClick={handleSave}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700">
              Save URL
            </button>
          )}
        </div>
      )}
    </div>
  )
}
