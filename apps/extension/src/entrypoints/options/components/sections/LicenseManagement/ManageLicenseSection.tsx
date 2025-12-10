import { useState } from 'react'

import { FormField } from '~/components/ui/forms'
import { useLicense } from '~/hooks/useLicense'
import { getLogger } from '~/utils/logger'

const log = getLogger('license-management')

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
      log.error('Failed to deactivate license:', err)
    } finally {
      setIsDeactivating(false)
    }
  }

  return (
    <FormField size="lg" description="Manage your current license activation">
      <div className="space-y-4">
        <div
          className="rounded-lg border border-orange-200 bg-orange-50 p-4"
          role="region"
          aria-labelledby="deactivation-info-heading">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h4
                className="mb-1 text-sm font-medium text-orange-800"
                id="deactivation-info-heading">
                About License Deactivation
              </h4>
              <p className="text-sm text-orange-700">
                Deactivating will free up this device slot, allowing you to
                activate the license on another browser or device. You can
                reactivate on this device later using the same license key.
              </p>
            </div>
          </div>
        </div>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 font-medium text-orange-700 transition-colors hover:bg-orange-100"
            aria-controls="deactivation-confirmation"
            aria-expanded={showConfirm}>
            Deactivate License on This Device
          </button>
        ) : (
          <div
            className="space-y-3"
            id="deactivation-confirmation"
            role="region"
            aria-labelledby="confirm-deactivation-heading">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h4
                className="mb-2 text-sm font-medium text-red-800"
                id="confirm-deactivation-heading">
                ⚠️ Confirm Deactivation
              </h4>
              <p className="text-sm text-red-700">
                Are you sure you want to deactivate your Pro license on this
                device? You&apos;ll lose access to Pro features until you
                reactivate.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className="flex flex-1 items-center justify-center rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:bg-gray-400"
                aria-label={`Confirm license deactivation ${isDeactivating ? '- deactivation in progress' : ''}`}>
                {isDeactivating && (
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
                Yes, Deactivate License
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeactivating}
                className="px-4 py-2 font-medium text-gray-600 hover:text-gray-800"
                aria-label="Cancel license deactivation">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </FormField>
  )
}
