import { useState } from "react"
import { useLicense } from "~/hooks/useLicense"
import { FieldControl } from "~/components/ui/forms"

export function ManageLicenseSection() {
  const { deactivate } = useLicense()
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeactivate = async () => {
    setIsDeactivating(true)
    try {
      await deactivate()
      // License deactivated successfully
      setShowConfirm(false)
    } catch (err) {
      console.error("Failed to deactivate license:", err)
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <FieldControl
      size="lg"
      title="License Management"
      description="Manage your current license activation"
    >
      <div className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-orange-800 mb-1">
                About License Deactivation
              </h4>
              <p className="text-sm text-orange-700">
                Deactivating will free up this device slot, allowing you to activate the license on another browser or device. 
                You can reactivate on this device later using the same license key.
              </p>
            </div>
          </div>
        </div>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full px-4 py-2 text-orange-700 bg-orange-50 border border-orange-300 hover:bg-orange-100 rounded-lg font-medium transition-colors"
          >
            Deactivate License on This Device
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                ⚠️ Confirm Deactivation
              </h4>
              <p className="text-sm text-red-700">
                Are you sure you want to deactivate your Pro license on this device? 
                You'll lose access to Pro features until you reactivate.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isDeactivating && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Yes, Deactivate License
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeactivating}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </FieldControl>
  )
}