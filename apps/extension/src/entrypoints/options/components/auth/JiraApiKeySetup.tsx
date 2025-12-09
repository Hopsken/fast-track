import React, { useEffect, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@internal/ui/components/card'
import { Input } from '@internal/ui/components/input'
import { Label } from '@internal/ui/components/label'

export interface JiraApiKeySetupProps {
  onConnect: (payload: { host: string; email: string; apiKey: string }) => void
  isLoading?: boolean
  defaultValues?: Partial<{ host: string; email: string; apiKey: string }>
  error?: string | null
}

export const JiraApiKeySetup: React.FC<JiraApiKeySetupProps> = ({
  onConnect,
  isLoading = false,
  defaultValues,
  error
}) => {
  const [host, setHost] = useState(defaultValues?.host ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')
  const [apiKey, setApiKey] = useState(defaultValues?.apiKey ?? '')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    setHost(defaultValues?.host ?? '')
    setEmail(defaultValues?.email ?? '')
    setApiKey(defaultValues?.apiKey ?? '')
  }, [defaultValues])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onConnect({
      host: host.trim(),
      email: email.trim(),
      apiKey: apiKey.trim()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Connect with API key</CardTitle>
        <CardDescription>
          Use your Atlassian API token when OAuth is not available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="host">Jira site URL</Label>
            <Input
              id="host"
              type="text"
              name="host"
              autoComplete="url"
              value={host}
              onChange={(event) => setHost(event.target.value)}
              placeholder="https://your-domain.atlassian.net"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Jira account email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API token</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                name="apiKey"
                autoComplete="off"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Paste your Atlassian API token"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowKey((prev) => !prev)}
                className="min-w-[100px]">
                {showKey ? 'Hide' : 'Show'}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Generate a token from your Atlassian account: Account settings
              &gt; Security &gt; Create and manage API tokens.
            </p>
            <p className="text-muted-foreground mt-2 text-xs">
              Required scopes: Read &mdash; read:jira-user, read:jira-work.
              Write &mdash; write:jira-work.
            </p>
          </div>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Connect'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
