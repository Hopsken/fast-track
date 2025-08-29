import { useState } from "react"
import { LEMON_CHECKOUT_LINK } from "~/constants"
import { useLicense } from "~/hooks/useLicense"
import { FieldControl } from "~/components/ui/forms"

export function UpgradeSection() {
  return (
    <div className="space-y-6">
      <FieldControl
        size="lg"
        title="Upgrade to Pro"
        description="Unlock all premium features and support future development"
      >
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg text-blue-900 mb-2">
              🚀 Early Bird Special - Limited Time!
            </h3>
            <p className="text-blue-700 font-medium mb-4">
              Lock in your lifetime discount now at $9.99
            </p>
            
            <div className="space-y-2 text-sm text-blue-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Unlock all existing Pro features</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>All future Pro features included free</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Works on up to 3 different browsers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Cross-browser compatibility (Chrome, Firefox, Edge, Brave)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>License survives extension reinstalls</span>
              </div>
            </div>

            <a
              href={LEMON_CHECKOUT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
            >
              Get Pro License - $9.99
            </a>
          </div>
          
          <ActivateExistingLicense />
        </div>
      </FieldControl>
    </div>
  )
}

function ActivateExistingLicense() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [licenseKey, setLicenseKey] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { activate } = useLicense()

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError("Please enter a license key")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await activate(licenseKey.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setLicenseKey("")
        setIsExpanded(false)
        // License activated successfully
      }
    } catch (err) {
      setError("Something went wrong. Please try again later or contact hi@hopsken.com for help")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isExpanded) {
    return (
      <div className="text-center">
        <button
          onClick={() => setIsExpanded(true)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
        >
          Already have a license key? Click here to activate
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter License Key
        </label>
        <input
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Paste your license key here"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handleActivate}
          disabled={isLoading || !licenseKey.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isLoading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Activate License
        </button>
        <button
          onClick={() => {
            setIsExpanded(false)
            setLicenseKey("")
            setError("")
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}