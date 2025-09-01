import { useMemo } from 'react'

import { InputFormField } from '~/components/ui/forms'
import { useJiraConfig } from '~/hooks/useStorageSettings'

export function JiraHostInput() {
  const { jiraHost, updateJiraConfig } = useJiraConfig()

  const setJiraHost = (value: string) => {
    updateJiraConfig({ host: value })
  }

  const isValid = useMemo(() => jiraHost.startsWith('http'), [jiraHost])
  const errorMessage =
    jiraHost && !isValid
      ? 'Please enter a valid URL starting with http'
      : undefined

  return (
    <InputFormField
      size="lg"
      title="Jira URL"
      description="Your Jira instance URL for API access and quick navigation"
      value={jiraHost}
      onChange={setJiraHost}
      placeholder="https://your-domain.atlassian.net"
      error={errorMessage}
      helperText={
        <>
          Used for API integration and quick ticket access via omnibox:{' '}
          <kbd className="kbd kbd-sm">jira</kbd> +{' '}
          <kbd className="kbd kbd-sm">Space</kbd> + ticket ID
        </>
      }
    />
  )
}
