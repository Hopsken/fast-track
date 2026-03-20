import React from 'react'
import { Button } from '@internal/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@internal/ui/components/card'
import { Spinner } from '@internal/ui/components/spinner'

export interface JiraOAuthSetupProps {
  onConnect: () => void
  onSwitchToApiKey?: () => void
  showPostConnectFallback?: boolean
  isLoading: boolean
  error?: string | null
}

export const JiraOAuthSetup: React.FC<JiraOAuthSetupProps> = ({
  onConnect,
  onSwitchToApiKey,
  showPostConnectFallback = false,
  isLoading = false,
  error
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sign in with Atlassian</CardTitle>
        <CardDescription>
          Connect your Jira workspace. Secure OAuth 2.0 — no passwords stored.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-xs">
          You&apos;ll be redirected to Atlassian to select your workspace and
          authorize the extension.
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        <Button className="w-full" onClick={onConnect} disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner />
              Connecting...
            </div>
          ) : (
            'Connect to Jira'
          )}
        </Button>

        {showPostConnectFallback && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs">
              Your org may require admin approval/allowlisting for OAuth. Try
              API token login instead.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={onSwitchToApiKey}
              disabled={!onSwitchToApiKey}>
              Use API key instead
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
