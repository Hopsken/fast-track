import { useEffect, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useCurrentJiraHost } from '~/hooks/useCurrentJiraHost'
import { getTemplateService } from '~/services/template-service'
import type { IssueTemplate } from '~/types/template'

import { TemplateWizard } from './template-wizard'

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: currentHost, isLoading: hostLoading } = useCurrentJiraHost()

  const [template, setTemplate] = useState<IssueTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!id) return
      setError(null)
      setIsLoading(true)

      try {
        const svc = getTemplateService()
        const t = await svc.getTemplate(id)
        if (cancelled) return
        setTemplate(t)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (cancelled) return
        setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (isLoading || hostLoading) {
    return <div className="text-sm text-gray-600">Loading…</div>
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
        <Button asChild variant="secondary">
          <Link to="/templates">Back to templates</Link>
        </Button>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          Template not found.
        </div>
        <Button asChild variant="secondary">
          <Link to="/templates">Back to templates</Link>
        </Button>
      </div>
    )
  }

  if (!currentHost || template.scope.baseUrlHost !== currentHost) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This template belongs to{' '}
          <span className="font-medium">{template.scope.baseUrlHost}</span>.
          {currentHost ? (
            <span>
              {' '}
              You are currently connected to{' '}
              <span className="font-medium">{currentHost}</span>.
            </span>
          ) : (
            <span> You are not currently connected.</span>
          )}{' '}
          Editing is disabled.
        </div>
        <Button asChild variant="secondary">
          <Link to="/templates">Back to templates</Link>
        </Button>
      </div>
    )
  }

  return (
    <TemplateWizard.Provider
      mode="edit"
      host={currentHost}
      template={template}
      onSaved={() => navigate('/templates')}
      onDeleted={() => navigate('/templates')}>
      <TemplateWizard.Editor />
    </TemplateWizard.Provider>
  )
}
