import {
  LicenseStatus,
  UpgradeSection,
  ManageLicenseSection
} from '~/components/options/sections/LicenseManagement'
import { useLicense } from '~/hooks/useLicense'

export function LicenseTab() {
  const { license } = useLicense()

  return (
    <div className="space-y-8">
      {license ? (
        <>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Current License
            </h2>
            <LicenseStatus />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              License Management
            </h2>
            <ManageLicenseSection />
          </div>
        </>
      ) : (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Upgrade to Pro
          </h2>
          <UpgradeSection />
        </div>
      )}
    </div>
  )
}
