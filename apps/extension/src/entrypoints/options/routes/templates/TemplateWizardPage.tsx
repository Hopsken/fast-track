import { Button } from '@internal/ui/components/button'
import { Link, useNavigate } from 'react-router-dom'

import { LoadingCursor } from '@/components/LoadingCursor'
import { useCurrentJiraHost } from '~/hooks/useCurrentJiraHost'
import { useStorage } from '~/hooks/useStorage'
import { useTemplates } from '~/hooks/useTemplates'
import { BOOST_WEBSITE_BASE_URL } from '~/lib/api'

import { TemplateWizard } from './template-wizard'

export function TemplateWizardPage() {
  const navigate = useNavigate()
  const { data: currentHost, isLoading: hostLoading } = useCurrentJiraHost()
  const { data: templates, isLoading: templatesLoading } = useTemplates({
    includeOtherHosts: true
  })
  const [snapshot, , snapshotState] = useStorage('SubscriptionSnapshot')

  const isPro = snapshotState === 'success' ? (snapshot?.isPro ?? false) : null
  const templateCount =
    templates?.filter((t) => t.scope.baseUrlHost === currentHost).length ?? 0
  const isAtFreeLimit = isPro === false && templateCount >= 3

  if (hostLoading || templatesLoading) {
    return <LoadingCursor />
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

  if (isAtFreeLimit) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          You’ve reached the Free plan limit (3 issue templates per Jira
          workspace). Upgrade to Pro to create more.
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link to="/templates">Back to templates</Link>
          </Button>

          <Button asChild>
            <a
              href={`${BOOST_WEBSITE_BASE_URL}/pricing`}
              target="_blank"
              rel="noreferrer">
              Upgrade
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TemplateWizard.Provider
      mode="create"
      host={currentHost}
      onCreated={() => {
        navigate(`/templates`)
      }}>
      <TemplateWizard.Editor />
    </TemplateWizard.Provider>
  )
}
