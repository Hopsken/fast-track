import { Button } from '@internal/ui/components/button'
import { Link, useNavigate } from 'react-router-dom'

import { LoadingCursor } from '@/components/LoadingCursor'
import { useCurrentJiraHost } from '~/hooks/useCurrentJiraHost'

import { TemplateWizard } from './template-wizard'

export function TemplateWizardPage() {
  const navigate = useNavigate()
  const { data: currentHost, isLoading: hostLoading } = useCurrentJiraHost()

  if (hostLoading) {
    return <LoadingCursor />
  }

  if (!currentHost) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Connect Jira first to create templates.
        </div>
        <Button asChild variant="secondary">
          <Link to="/workflow/templates">Back to templates</Link>
        </Button>
      </div>
    )
  }

  return (
    <TemplateWizard.Provider
      mode="create"
      host={currentHost}
      onCreated={() => {
        navigate(`/workflow/templates`)
      }}>
      <TemplateWizard.Editor />
    </TemplateWizard.Provider>
  )
}
