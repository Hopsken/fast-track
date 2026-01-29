import { useEffect, useMemo, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@internal/ui/components/alert-dialog'
import { Button } from '@internal/ui/components/button'
import { Input } from '@internal/ui/components/input'
import { Label } from '@internal/ui/components/label'
import { Textarea } from '@internal/ui/components/textarea'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useCurrentJiraHost } from '~/hooks/useCurrentJiraHost'
import { getTemplateService } from '~/services/template-service'
import type { IssueTemplate } from '~/types/template'

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { host: currentHost, isLoading: hostLoading } = useCurrentJiraHost()

  const [template, setTemplate] = useState<IssueTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [descriptionTemplate, setDescriptionTemplate] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const readOnly = useMemo(() => {
    if (!template) return true
    if (!currentHost) return true
    return template.scope.baseUrlHost !== currentHost
  }, [currentHost, template])

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
        if (t) {
          setName(t.name)
          setDescriptionTemplate(t.descriptionTemplate ?? '')
        }
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

  async function handleSave() {
    if (!id || !template) return

    setSaveError(null)
    setIsSaving(true)

    try {
      const svc = getTemplateService()
      const updated = await svc.updateTemplate(id, {
        name: name.trim(),
        descriptionTemplate: descriptionTemplate.trim()
          ? descriptionTemplate
          : undefined
      })

      setTemplate(updated)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!id) return

    setError(null)
    try {
      const svc = getTemplateService()
      await svc.deleteTemplate(id)
      navigate('/templates')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

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

  const mismatch = currentHost
    ? template.scope.baseUrlHost !== currentHost
    : true

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">Edit template</h2>
          <p className="text-sm text-gray-600">
            {template.scope.projectKey} • {template.scope.issueTypeName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link to="/templates">Back</Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete template?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action can’t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="secondary">Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    variant="destructive"
                    onClick={() => void handleDelete()}>
                    Delete
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {mismatch ? (
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
          Editing is disabled, but you can still delete it.
        </div>
      ) : null}

      {saveError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {saveError}
        </div>
      ) : null}

      <div className="rounded-md border bg-white">
        <div className="border-b px-4 py-3">
          <div className="text-sm font-medium text-gray-900">Basics</div>
          <div className="text-xs text-gray-600">
            Host: {template.scope.baseUrlHost}
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="detail-name">Name</Label>
            <Input
              id="detail-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detail-description">Description template</Label>
            <Textarea
              id="detail-description"
              value={descriptionTemplate}
              onChange={(e) => setDescriptionTemplate(e.target.value)}
              readOnly={readOnly}
            />
            {readOnly ? (
              <div className="text-xs text-gray-600">
                Read-only due to Jira site mismatch.
              </div>
            ) : null}
          </div>

          {!readOnly ? (
            <div className="flex items-center justify-end">
              <Button
                onClick={() => void handleSave()}
                disabled={isSaving || !name.trim()}>
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
