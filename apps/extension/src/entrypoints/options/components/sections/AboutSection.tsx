import { FormField } from '~/components/ui/forms'

interface AboutSectionProps {
  version: string
}

export function AboutSection({ version }: AboutSectionProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-2">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-gray-900">
              About Fast Track v2
            </h3>
            <p className="text-sm text-gray-500">
              Enhanced Jira experience with quick ticket search
            </p>
          </div>
          <div className="space-y-4 text-sm text-gray-600">
            <p className="leading-relaxed">
              Version 2 introduces a completely redesigned popup focused on
              quick ticket search. Now you can instantly find and access any
              Jira ticket you&apos;ve recently viewed.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">New Features</h4>
              <ul
                className="space-y-2 text-gray-600"
                aria-label="New features in version 2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-500" aria-hidden="true">
                    •
                  </span>
                  <span>Lightning-fast ticket search with fuzzy matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-500" aria-hidden="true">
                    •
                  </span>
                  <span>Automatic data collection from Jira pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-500" aria-hidden="true">
                    •
                  </span>
                  <span>Keyboard navigation and shortcuts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-500" aria-hidden="true">
                    •
                  </span>
                  <span>Relevance-based search results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-blue-500" aria-hidden="true">
                    •
                  </span>
                  <span>Clean, distraction-free interface</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <FormField
        size="lg"
        title="Version"
        description="Current extension version and build information">
        <div
          className="flex items-center justify-between"
          role="group"
          aria-label="Version information">
          <span
            className="font-mono text-sm text-gray-600"
            aria-label={`Version ${version}`}>
            v{version}
          </span>
        </div>
      </FormField>
    </div>
  )
}
