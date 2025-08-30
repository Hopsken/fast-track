/**
 * Component for displaying Jira API connection status
 */

import { useState, useEffect } from "react"
import { HiCheckCircle, HiXCircle, HiClock } from "react-icons/hi"
import { browser } from "wxt/browser"

import { useJiraConfig } from "~/hooks/useStorageSettings"

export function ApiConnectionStatus() {
  const { isConfigComplete } = useJiraConfig()
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const testConnection = async () => {
    if (!isConfigComplete) {
      setConnectionStatus("error")
      setErrorMessage("API configuration is incomplete")
      return
    }

    setConnectionStatus("testing")
    setErrorMessage("")

    try {
      const response = await browser.runtime.sendMessage({
        type: "TEST_API_CONNECTION"
      })

      if (response.success && response.data?.success) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
        setErrorMessage(
          response.data?.error || response.error || "Connection test failed"
        )
      }
    } catch {
      setConnectionStatus("error")
      setErrorMessage("Failed to test connection")
    }
  }

  useEffect(() => {
    if (isConfigComplete) {
      testConnection()
    }
  }, [isConfigComplete])

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "testing":
        return <HiClock className="h-5 w-5 animate-spin text-yellow-500" />
      case "success":
        return <HiCheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <HiXCircle className="h-5 w-5 text-red-500" />
      default:
        return <HiClock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "testing":
        return "Testing connection..."
      case "success":
        return "Connection successful"
      case "error":
        return errorMessage || "Connection failed"
      default:
        return isConfigComplete ? "Ready to test" : "Configuration required"
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "testing":
        return "text-yellow-600"
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <p className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          {connectionStatus === "idle" && !isConfigComplete && (
            <p className="mt-1 text-xs text-gray-500">
              Configure your Jira URL, email, and API token below
            </p>
          )}
        </div>
      </div>

      {isConfigComplete &&
        (connectionStatus === "success" || connectionStatus === "error") && (
          <button
            onClick={testConnection}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
            disabled={false}>
            Test Connection
          </button>
        )}
    </div>
  )
}
