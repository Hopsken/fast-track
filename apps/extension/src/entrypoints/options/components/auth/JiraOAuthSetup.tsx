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
  isLoading: boolean
}

export const JiraOAuthSetup: React.FC<JiraOAuthSetupProps> = ({
  onConnect,
  isLoading = false
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

          <p className="text-muted-foreground text-center text-xs">
            You&apos;ll be redirected to Atlassian to select your workspace and
            authorize the extension. No passwords are stored.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
