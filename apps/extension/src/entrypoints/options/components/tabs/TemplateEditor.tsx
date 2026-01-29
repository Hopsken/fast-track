import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { omit } from 'lodash-es'

import { templateService, ticketService } from '@/services'
import type { CachedFieldMetadata, IssueTemplate } from '~/types/template'

interface TemplateEditorProps {
  templateId: string | null
  initialDraft: Omit<IssueTemplate, 'id' | 'createdAt' | 'updatedAt'>
}

function getCacheKey(input: {
  baseUrlHost: string
  projectKey: string
  issueTypeId: string
}) {
  return `${input.baseUrlHost}:${input.projectKey}:${input.issueTypeId}`
}

function mapCreateMetaToCache(input: {
  cacheKey: string
  meta: unknown
}): CachedFieldMetadata {
  const metaRecord = input.meta as Record<string, unknown>
  const fieldsRecord = (metaRecord.fields ?? {}) as Record<string, unknown>

  const fields = Object.entries(fieldsRecord).map(([fieldId, field]) => {
    // jira.js models aren't strongly typed for individual field metadata,
    // so we keep the mapping narrow and avoid `any` propagation.
    const record = field as unknown as Record<string, unknown>

    const schema = (record.schema ?? {}) as unknown
    const allowedValues = record.allowedValues as unknown

    return {
      fieldId,
      key: (record.key as string | undefined) ?? fieldId,
      name: (record.name as string | undefined) ?? fieldId,
      required: Boolean(record.required),
      schema: schema as CachedFieldMetadata['fields'][number]['schema'],
      allowedValues:
        allowedValues as CachedFieldMetadata['fields'][number]['allowedValues'],
      autoCompleteUrl: record.autoCompleteUrl as string | undefined,
      hasDefaultValue: Boolean(record.hasDefaultValue),
      defaultValue: record.defaultValue as unknown
    }
  })

  return {
    cacheKey: input.cacheKey,
    lastUpdated: new Date().toISOString(),
    fields
  }
}

export function TemplateEditor({
  templateId,
  initialDraft
}: TemplateEditorProps) {
  const stableTemplateService = useMemo(() => templateService, [])
  const stableTicketService = useMemo(() => ticketService, [])
  const [draft, setDraft] = useState(initialDraft)
  const [loadedTemplate, setLoadedTemplate] = useState<IssueTemplate | null>(
    null
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metaLoading, setMetaLoading] = useState(false)
  const [metaError, setMetaError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setError(null)
      setMetaError(null)

      if (!templateId) {
        setLoadedTemplate(null)
        setDraft(initialDraft)
        return
      }

      try {
        const t = await stableTemplateService.getTemplate(templateId)
        if (cancelled) return
        setLoadedTemplate(t)
        if (t) {
          const draft = omit(t, ['id', 'createdAt', 'updatedAt'])
          setDraft(draft)
        }
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [templateId, initialDraft, stableTemplateService])

  const scopeBaseUrlHost = draft.scope.baseUrlHost.trim()
  const scopeProjectKey = draft.scope.projectKey.trim()
  const scopeIssueTypeId = draft.scope.issueTypeId.trim()

  const canFetchMeta = scopeBaseUrlHost && scopeProjectKey && scopeIssueTypeId

  const handleFetchMeta = useCallback(async () => {
    setMetaError(null)

    if (!canFetchMeta) {
      setMetaError(
        'Please fill Jira Host, Project Key, and Issue Type Id first.'
      )
      return
    }

    setMetaLoading(true)
    try {
      const meta = await stableTicketService.getCreateIssueFields({
        projectIdOrKey: scopeProjectKey,
        issueTypeId: scopeIssueTypeId
      })

      const cacheKey = getCacheKey({
        baseUrlHost: scopeBaseUrlHost,
        projectKey: scopeProjectKey,
        issueTypeId: scopeIssueTypeId
      })

      const cache = mapCreateMetaToCache({ cacheKey, meta })
      await stableTemplateService.updateFieldMetadataCache(cacheKey, cache)
    } catch (e) {
      setMetaError(e instanceof Error ? e.message : String(e))
    } finally {
      setMetaLoading(false)
    }
  }, [
    canFetchMeta,
    scopeIssueTypeId,
    scopeProjectKey,
    scopeBaseUrlHost,
    stableTemplateService,
    stableTicketService
  ])

  const handleSave = useCallback(async () => {
    setError(null)
    setIsSaving(true)

    try {
      if (templateId) {
        await stableTemplateService.updateTemplate(templateId, {
          ...draft
        })
      } else {
        await stableTemplateService.createTemplate(draft)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSaving(false)
    }
  }, [draft, stableTemplateService, templateId])

  const handleDelete = useCallback(async () => {
    if (!templateId) return

    setError(null)
    try {
      await stableTemplateService.deleteTemplate(templateId)
      setLoadedTemplate(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [stableTemplateService, templateId])

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="template-name">Name</Label>
          <Input
            id="template-name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Bug report"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-site">Jira Host</Label>
          <Input
            id="template-site"
            value={draft.scope.baseUrlHost}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                scope: { ...d.scope, baseUrlHost: e.target.value }
              }))
            }
            placeholder="your-company.atlassian.net"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-project">Project Key</Label>
          <Input
            id="template-project"
            value={draft.scope.projectKey}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                scope: { ...d.scope, projectKey: e.target.value }
              }))
            }
            placeholder="PROJ"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-issuetypeid">Issue Type Id</Label>
          <Input
            id="template-issuetypeid"
            value={draft.scope.issueTypeId}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                scope: { ...d.scope, issueTypeId: e.target.value }
              }))
            }
            placeholder="10001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-issuetypename">Issue Type Name</Label>
          <Input
            id="template-issuetypename"
            value={draft.scope.issueTypeName}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                scope: { ...d.scope, issueTypeName: e.target.value }
              }))
            }
            placeholder="Bug"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-description">Description template</Label>
        <Textarea
          id="template-description"
          value={draft.descriptionTemplate ?? ''}
          onChange={(e) =>
            setDraft((d) => ({ ...d, descriptionTemplate: e.target.value }))
          }
          placeholder="Steps to reproduce..."
        />
        <p className="text-xs text-gray-500">
          MVP note: field-level behaviors (preset/visible/ignore) UI will be
          added later. This tab currently focuses on scope + template basics.
        </p>
      </div>

      <div className="rounded-md border border-gray-200 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">
              Jira create-meta fields
            </div>
            <div className="text-xs text-gray-600">
              Fetch create-meta for the current scope and seed local cache.
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleFetchMeta}
            disabled={metaLoading}>
            {metaLoading ? 'Fetching…' : 'Fetch & Seed Cache'}
          </Button>
        </div>
        {metaError ? (
          <div className="mt-3 text-sm text-red-700">{metaError}</div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {(() => {
              if (isSaving) return 'Saving…'
              if (templateId) return 'Save'
              return 'Create'
            })()}
          </Button>

          {templateId ? (
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
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>

        {loadedTemplate ? (
          <div className="text-xs text-gray-500">
            Last updated: {new Date(loadedTemplate.updatedAt).toLocaleString()}
          </div>
        ) : null}
      </div>
    </div>
  )
}
