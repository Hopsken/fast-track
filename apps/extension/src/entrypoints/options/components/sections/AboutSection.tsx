import { FormField } from '~/components/ui/forms'

interface AboutSectionProps {
  version: string
}

export function AboutSection({ version }: AboutSectionProps) {
  return (
    <div className="space-y-6">
      <div className="border-border bg-card rounded-lg border p-6">
        <div className="space-y-2">
          <div className="space-y-1">
            <h3 className="text-foreground text-xl font-semibold">
              About Fast Track v2
            </h3>
            <p className="text-muted-foreground text-sm">
              Enhanced Jira experience with quick ticket search
            </p>
          </div>
          <div className="text-muted-foreground space-y-4 text-sm">
            <p className="leading-relaxed">
              Version 2 introduces a completely redesigned popup focused on
              quick ticket search. Now you can instantly find and access any
              Jira ticket you&apos;ve recently viewed.
            </p>
            <div className="space-y-2">
              <h4 className="text-foreground font-medium">New Features</h4>
              <ul
                className="text-muted-foreground space-y-2"
                aria-label="New features in version 2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 select-none" aria-hidden="true">
                    —
                  </span>
                  <span>Lightning-fast ticket search with fuzzy matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 select-none" aria-hidden="true">
                    —
                  </span>
                  <span>Automatic data collection from Jira pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 select-none" aria-hidden="true">
                    —
                  </span>
                  <span>Keyboard navigation and shortcuts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 select-none" aria-hidden="true">
                    —
                  </span>
                  <span>Relevance-based search results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 select-none" aria-hidden="true">
                    —
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
            className="text-muted-foreground font-mono text-sm"
            aria-label={`Version ${version}`}>
            v{version}
          </span>
        </div>
      </FormField>
    </div>
  )
}
