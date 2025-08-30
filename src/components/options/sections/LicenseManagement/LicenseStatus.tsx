import { ProBadge } from '~/components/ProBadge'
import { FieldControl } from '~/components/ui/forms'
import { useLicense } from '~/hooks/useLicense'

export function LicenseStatus() {
  const { license, valid } = useLicense()

  if (!license) {
    return null
  }

  return (
    <FieldControl
      size="lg"
      title="License Status"
      description="Your current Jira Boost Pro license information">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ProBadge isPro={valid} />
          <span className="text-sm text-gray-600">
            {valid ? 'Active License' : 'License Issue'}
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <dl className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <dt className="font-medium text-gray-700">Device ID</dt>
              <dd className="font-mono text-gray-600">
                {license.instance.name}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">License Email</dt>
              <dd className="text-gray-600">{license.meta.customer_email}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700">Status</dt>
              <dd
                className={`font-medium ${valid ? 'text-green-600' : 'text-red-600'}`}>
                {valid ? 'Valid' : 'Invalid/Expired'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </FieldControl>
  )
}
