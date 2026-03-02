import React from 'react'
import { Button } from '@internal/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@internal/ui/components/card'
import { Separator } from '@internal/ui/components/separator'
import { Spinner } from '@internal/ui/components/spinner'
import {
  ShieldCheck as Shield,
  Zap as Lightning,
  RefreshCcw as Sync
} from 'lucide-react'

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
          Get started by connecting your Jira workspace to unlock enhanced
          productivity features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-foreground text-xs font-medium">
              Secure login
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Lightning className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-foreground text-xs font-medium">
              Quick setup
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Sync className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-foreground text-xs font-medium">
              Stay synced
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-muted-foreground text-xs">
            You&apos;ll be redirected to Atlassian to select your workspace and
            authorize the extension. No passwords are stored.
          </p>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
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
        </div>
      </CardContent>
    </Card>
  )
}
