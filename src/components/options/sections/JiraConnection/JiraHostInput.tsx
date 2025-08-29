import { useMemo } from "react"
import { useStorage, StorageKey } from "~/storage"
import { FieldControl } from "~/components/ui/forms"

export function JiraHostInput() {
  const [jiraHost, setJiraHost] = useStorage(StorageKey.JiraUrl, "")

  const isValid = useMemo(() => jiraHost.startsWith("http"), [jiraHost])

  return (
    <FieldControl
      size="lg"
      title="Jira URL"
      description="Your Jira instance URL for API access and quick navigation"
    >
      <div className="w-full space-y-2">
        <input
          type="text"
          placeholder="https://your-domain.atlassian.net"
          value={jiraHost}
          onChange={(e) => setJiraHost(e.target.value)}
          className={`input input-lg input-bordered w-full ${
            !isValid ? "input-error" : ""
          }`}
        />
        {jiraHost && !isValid && (
          <p className="text-xs text-red-500 mt-1">Please enter a valid URL starting with http</p>
        )}
        <p className="text-xs text-gray-500">
          Used for API integration and quick ticket access via omnibox:{" "}
          <kbd className="kbd kbd-sm">jira</kbd> +{" "}
          <kbd className="kbd kbd-sm">Space</kbd> + ticket ID
        </p>
      </div>
    </FieldControl>
  )
}