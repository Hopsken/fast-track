import { useState } from 'react'

import { LEMON_CHECKOUT_LINK } from '~/constants'
import { useLicense } from '~/hooks/useLicense'

export function UpgradeSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div
          className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6"
          role="region"
          aria-labelledby="upgrade-offer-title">
          <div
            className="mb-4 space-y-2 text-sm text-blue-800"
            role="list"
            aria-label="Pro features included">
            <div className="flex items-center gap-2" role="listitem">
              <span className="text-green-600" aria-hidden="true">
                ✓
              </span>
              <span>All future Pro features</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <span className="text-green-600" aria-hidden="true">
                ✓
              </span>
              <span>Support development</span>
            </div>
          </div>

          <a
            href={LEMON_CHECKOUT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700"
            aria-label="Purchase Pro License for $10 - Opens in new tab">
            Get Pro License - $10
          </a>
        </div>

        <ActivateExistingLicense />
      </div>
    </div>
  )
}

function ActivateExistingLicense() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { activate } = useLicense()

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await activate(licenseKey.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setLicenseKey('')
        setIsExpanded(false)
        // License activated successfully
      }
    } catch (error) {
      console.error('Error activating license:', error)
      setError(
        'Something went wrong. Please try again later or contact support@teamusement.com for help'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!isExpanded) {
    return (
      <div className="text-center">
        <button
          onClick={() => setIsExpanded(true)}
          className="text-sm font-medium text-blue-600 underline hover:text-blue-700"
          aria-controls="license-activation-form"
          aria-expanded={isExpanded}>
          Already have a license key? Click here to activate
        </button>
      </div>
    )
  }

  return (
    <div
      className="space-y-4 rounded-lg bg-gray-50 p-4"
      id="license-activation-form"
      role="region"
      aria-label="License activation form">
      <div>
        <label
          className="mb-2 block text-sm font-medium text-gray-700"
          htmlFor="license-key-input">
          Enter License Key
        </label>
        <input
          id="license-key-input"
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Paste your license key here"
          className={`w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isLoading}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'license-key-error' : undefined}
        />
        {error && (
          <p
            className="mt-1 text-sm text-red-600"
            id="license-key-error"
            role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleActivate}
          disabled={isLoading || !licenseKey.trim()}
          className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          aria-label={`Activate license ${isLoading ? '- activation in progress' : ''}`}>
          {isLoading && (
            <svg
              className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Activate License
        </button>
        <button
          onClick={() => {
            setIsExpanded(false)
            setLicenseKey('')
            setError('')
          }}
          className="px-4 py-2 font-medium text-gray-600 hover:text-gray-800"
          disabled={isLoading}
          aria-label="Cancel license activation">
          Cancel
        </button>
      </div>
    </div>
  )
}
