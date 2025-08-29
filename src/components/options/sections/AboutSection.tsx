import { FieldControl } from "~/components/ui/forms"

interface AboutSectionProps {
  version: string
}

export function AboutSection({ version }: AboutSectionProps) {
  return (
    <div className="space-y-6">
      <FieldControl
        size="lg"
        title="About Jira Boost v2"
        description="Enhanced Jira experience with quick ticket search"
      >
        <div className="text-sm text-gray-600 space-y-4">
          <p className="leading-relaxed">
            Version 2 introduces a completely redesigned popup focused on quick ticket search. 
            Now you can instantly find and access any Jira ticket you've recently viewed.
          </p>
          <div>
            <h4 className="font-medium text-gray-800 mb-3">New Features:</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Lightning-fast ticket search with fuzzy matching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Automatic data collection from Jira pages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Keyboard navigation and shortcuts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Relevance-based search results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Clean, distraction-free interface</span>
              </li>
            </ul>
          </div>
        </div>
      </FieldControl>

      <FieldControl
        size="lg"
        title="Keyboard Shortcuts"
        description="Master the extension with these shortcuts"
      >
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Open popup</span>
              <kbd className="kbd kbd-sm">Alt+J</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Clear search</span>
              <kbd className="kbd kbd-sm">Esc</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Navigate results</span>
              <kbd className="kbd kbd-sm">↑ ↓</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Quick jump</span>
              <div className="flex gap-1">
                <kbd className="kbd kbd-sm text-xs">jira</kbd>
                <span className="text-gray-400">+</span>
                <kbd className="kbd kbd-sm">Space</kbd>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Open ticket</span>
              <kbd className="kbd kbd-sm">Enter</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Open settings</span>
              <kbd className="kbd kbd-sm">⚙️</kbd>
            </div>
          </div>
        </div>
      </FieldControl>

      <FieldControl
        size="lg"
        title="Version"
        description="Current extension version and build information"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-gray-600">v{version}</span>
          <span className="text-xs text-gray-500">WXT Framework</span>
        </div>
      </FieldControl>
    </div>
  )
}