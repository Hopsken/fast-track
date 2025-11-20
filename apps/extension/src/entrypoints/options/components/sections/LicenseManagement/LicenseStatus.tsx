import { ProBadge } from '~/components/ProBadge'
import { FormField } from '~/components/ui/forms'
import { useLicense } from '~/hooks/useLicense'

export function LicenseStatus() {
  const { license, valid } = useLicense()

  if (!license) {
    return null
  }

  return (
    <FormField
      size="lg"
      title="License Status"
      description="Your current Fast Track Pro license information">
      <div className="space-y-4">
        <div
          className="flex items-center gap-3"
          role="status"
          aria-label={`License status: ${valid ? 'Active License' : 'License Issue'}`}>
          <ProBadge isPro={valid} />
          <span className="text-sm text-gray-600">
            {valid ? 'Active License' : 'License Issue'}
          </span>
        </div>

        <div
          className="rounded-lg bg-gray-50 p-4"
          role="region"
          aria-labelledby="license-details-heading">
          <h3 id="license-details-heading" className="sr-only">
            License Details
          </h3>
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
    </FormField>
  )
}
