import { Button } from '@internal/ui/components/button'
import { Link, useNavigate } from 'react-router-dom'

import { useCurrentJiraHost } from '~/hooks/useCurrentJiraHost'

import { TemplateWizard } from './template-wizard'

export function TemplateWizardPage() {
  const navigate = useNavigate()
  const { host: currentHost, isLoading: hostLoading } = useCurrentJiraHost()

  if (hostLoading) {
    return <div className="text-sm text-gray-600">Loading…</div>
  }

  if (!currentHost) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Connect Jira first to create templates.
        </div>
        <Button asChild variant="secondary">
          <Link to="/templates">Back to templates</Link>
        </Button>
      </div>
    )
  }

  return (
    <TemplateWizard.Provider
      host={currentHost}
      onCreated={(id) => {
        navigate(`/templates/${id}`)
      }}>
      <div className="space-y-6">
        <TemplateWizard.Header />
        <TemplateWizard.ScopeStep />
        <TemplateWizard.FieldsStep />
        <TemplateWizard.BasicsStep />
      </div>
    </TemplateWizard.Provider>
  )
}
