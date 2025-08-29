import { useLicense } from "~/hooks/useLicense"
import { 
  LicenseStatus, 
  UpgradeSection, 
  ManageLicenseSection 
} from "~/components/options/sections/LicenseManagement"

export function LicenseTab() {
  const { license } = useLicense()

  return (
    <div className="space-y-8">
      {license ? (
        <>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current License</h2>
            <LicenseStatus />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">License Management</h2>
            <ManageLicenseSection />
          </div>
        </>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upgrade to Pro</h2>
          <UpgradeSection />
        </div>
      )}
    </div>
  )
}