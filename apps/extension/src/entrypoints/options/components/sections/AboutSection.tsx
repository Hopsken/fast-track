import { FormField } from '~/components/ui/forms'

interface AboutSectionProps {
  version: string
}

export function AboutSection({ version }: AboutSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        size="lg"
        title="About Jira Boost v2"
        description="Enhanced Jira experience with quick ticket search">
        <div className="space-y-4 text-sm text-gray-600">
          <p className="leading-relaxed">
            Version 2 introduces a completely redesigned popup focused on quick
            ticket search. Now you can instantly find and access any Jira ticket
            you&apos;ve recently viewed.
          </p>
          <div>
            <h4 className="mb-3 font-medium text-gray-800">New Features:</h4>
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
      </FormField>

      <FormField
        size="lg"
        title="Keyboard Shortcuts"
        description="Master the extension with these shortcuts">
        <div className="space-y-3 text-sm">
          <div
            className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2"
            role="table"
            aria-label="Keyboard shortcuts">
            <div className="flex items-center justify-between" role="row">
              <span className="text-gray-700" role="cell">
                Open popup
              </span>
              <kbd className="kbd kbd-sm" role="cell" aria-label="Alt plus J">
                Alt+J
              </kbd>
            </div>
            <div className="flex items-center justify-between" role="row">
              <span className="text-gray-700" role="cell">
                Clear search
              </span>
              <kbd className="kbd kbd-sm" role="cell" aria-label="Escape key">
                Esc
              </kbd>
            </div>
            <div className="flex items-center justify-between" role="row">
              <span className="text-gray-700" role="cell">
                Navigate results
              </span>
              <kbd
                className="kbd kbd-sm"
                role="cell"
                aria-label="Up and down arrow keys">
                ↑ ↓
              </kbd>
            </div>
            <div className="flex items-center justify-between" role="row">
              <span className="text-gray-700" role="cell">
                Quick jump
              </span>
              <div className="flex gap-1" role="cell">
                <kbd className="kbd kbd-sm text-xs" aria-label="Type jira">
                  jira
                </kbd>
                <span className="text-gray-400" aria-hidden="true">
                  +
                </span>
                <kbd className="kbd kbd-sm" aria-label="then space">
                  Space
                </kbd>
              </div>
            </div>
            <div className="flex items-center justify-between" role="row">
              <span className="text-gray-700" role="cell">
                Open ticket
              </span>
              <kbd className="kbd kbd-sm" role="cell" aria-label="Enter key">
                Enter
              </kbd>
            </div>
            <div className="flex items-center justify-between" role="row">
              <span className="text-gray-700" role="cell">
                Open settings
              </span>
              <kbd
                className="kbd kbd-sm"
                role="cell"
                aria-label="Settings gear icon">
                ⚙️
              </kbd>
            </div>
          </div>
        </div>
      </FormField>

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
          <span
            className="text-xs text-gray-500"
            aria-label="Built with WXT Framework">
            WXT Framework
          </span>
        </div>
      </FormField>
    </div>
  )
}
