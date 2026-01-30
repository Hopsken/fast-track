import { useCallback, useMemo, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import { Input } from '@internal/ui/components/input'
import { Label } from '@internal/ui/components/label'
import { Textarea } from '@internal/ui/components/textarea'
import { Link, useNavigate } from 'react-router-dom'

import { InputSearch, type SearchOption } from '@/components/ui'
import { useCurrentJiraHost } from '~/hooks/useCurrentJiraHost'
import { getProjectService } from '~/services/project-service'
import { getTemplateService } from '~/services/template-service'

type WizardScope = {
  projectKey: string
  projectName: string
  issueTypeId: string
  issueTypeName: string
}

type ProjectOption = { key: string; name: string }

type IssueTypeOption = { id: string; name: string }

type Step = 1 | 2

function toProjectSearchOption(
  project: ProjectOption
): SearchOption<ProjectOption> {
  return {
    value: project.key,
    label: `${project.key} — ${project.name}`,
    data: project
  }
}

function toIssueTypeSearchOption(
  issueType: IssueTypeOption
): SearchOption<IssueTypeOption> {
  return {
    value: issueType.id,
    label: issueType.name,
    data: issueType
  }
}

export function TemplateWizardPage() {
  const navigate = useNavigate()
  const { host: currentHost, isLoading: hostLoading } = useCurrentJiraHost()

  const [step, setStep] = useState<Step>(1)

  const [projectError, setProjectError] = useState<string | null>(null)

  const [issueTypes, setIssueTypes] = useState<IssueTypeOption[]>([])
  const [issueTypesLoading, setIssueTypesLoading] = useState(false)
  const [issueTypesError, setIssueTypesError] = useState<string | null>(null)

  const [scope, setScope] = useState<WizardScope>({
    projectKey: '',
    projectName: '',
    issueTypeId: '',
    issueTypeName: ''
  })

  const [name, setName] = useState('')
  const [descriptionTemplate, setDescriptionTemplate] = useState('')

  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const canProceedToStep2 = Boolean(
    scope.projectKey && scope.issueTypeId && scope.issueTypeName
  )

  const canSave =
    Boolean(name.trim()) && Boolean(currentHost) && canProceedToStep2

  const isIssueTypeDisabled = !scope.projectKey || issueTypesLoading

  const issueTypePlaceholder = (() => {
    if (!scope.projectKey) return 'Select a project first…'
    if (issueTypesLoading) return 'Loading issue types…'
    return 'Search issue types…'
  })()

  const issueTypeEmptyText =
    issueTypesError ??
    (scope.projectKey ? 'No issue types' : 'No project selected')

  const selectedProjectLabel = useMemo(() => {
    if (!scope.projectKey) return ''
    return scope.projectName
      ? `${scope.projectKey} — ${scope.projectName}`
      : scope.projectKey
  }, [scope.projectKey, scope.projectName])

  const getIssueTypeRecommendations = useCallback(async () => {
    return issueTypes.map(toIssueTypeSearchOption)
  }, [issueTypes])

  const getProjectRecommendations = useCallback(async () => {
    setProjectError(null)
    try {
      const svc = getProjectService()
      const projects = await svc.getRecentProjects()
      return projects.map(toProjectSearchOption)
    } catch (e) {
      setProjectError(e instanceof Error ? e.message : String(e))
      return []
    }
  }, [])

  const searchProjects = useCallback(async (query: string) => {
    setProjectError(null)
    try {
      const svc = getProjectService()
      const results = await svc.searchProjects(query.trim())
      return results.map(toProjectSearchOption)
    } catch (e) {
      setProjectError(e instanceof Error ? e.message : String(e))
      return []
    }
  }, [])

  const loadIssueTypes = useCallback(async (projectKey: string) => {
    setIssueTypesError(null)
    setIssueTypesLoading(true)
    try {
      const svc = getProjectService()
      const results = await svc.getProjectIssueTypes(projectKey)
      setIssueTypes(results)
    } catch (e) {
      setIssueTypesError(e instanceof Error ? e.message : String(e))
      setIssueTypes([])
    } finally {
      setIssueTypesLoading(false)
    }
  }, [])

  const handleSelectProject = useCallback(
    async (opt: SearchOption<ProjectOption> | null) => {
      if (!opt) {
        setScope({
          projectKey: '',
          projectName: '',
          issueTypeId: '',
          issueTypeName: ''
        })
        setIssueTypes([])
        setIssueTypesError(null)
        return
      }

      const project = opt.data ?? { key: opt.value, name: opt.label }

      setScope({
        projectKey: project.key,
        projectName: project.name,
        issueTypeId: '',
        issueTypeName: ''
      })

      getProjectService()
        .recordProjectClick(project.key)
        .catch(() => {
          // ignore
        })

      setIssueTypes([])
      await loadIssueTypes(project.key)
    },
    [loadIssueTypes]
  )

  const searchIssueTypes = useCallback(
    async (query: string) => {
      if (!scope.projectKey) return []

      const q = query.trim().toLowerCase()
      const results = issueTypes.filter((it) =>
        it.name.toLowerCase().includes(q)
      )

      return results.map(toIssueTypeSearchOption)
    },
    [issueTypes, scope.projectKey]
  )

  const handleSelectIssueType = useCallback(
    (opt: SearchOption<IssueTypeOption> | null) => {
      if (!opt) {
        setScope((s) => ({ ...s, issueTypeId: '', issueTypeName: '' }))
        return
      }

      const issueType = opt.data ?? { id: opt.value, name: opt.label }

      setScope((s) => ({
        ...s,
        issueTypeId: issueType.id,
        issueTypeName: issueType.name
      }))
    },
    []
  )

  async function handleSave() {
    if (!currentHost) return

    setSaveError(null)
    setIsSaving(true)
    try {
      const svc = getTemplateService()
      const created = await svc.createTemplate({
        name: name.trim(),
        icon: undefined,
        scope: {
          baseUrlHost: currentHost,
          projectKey: scope.projectKey,
          issueTypeId: scope.issueTypeId,
          issueTypeName: scope.issueTypeName
        },
        fields: {},
        descriptionTemplate: descriptionTemplate.trim()
          ? descriptionTemplate
          : undefined,
        lastUsedAt: undefined
      })

      navigate(`/templates/${created.id}`)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSaving(false)
    }
  }

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
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-500">
          New template • Step {step} of 2
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Create template</h2>
        <p className="text-sm text-gray-600">
          This template will be scoped to{' '}
          <span className="font-medium">{currentHost}</span>.
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="rounded-md border bg-white">
            <div className="border-b px-4 py-3">
              <div className="text-sm font-medium text-gray-900">Scope</div>
              <div className="text-xs text-gray-600">
                Select project and issue type.
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <InputSearch<ProjectOption>
                  placeholder="Search projects…"
                  value={scope.projectKey}
                  onSelect={(opt) => void handleSelectProject(opt)}
                  onSearch={searchProjects}
                  getRecommendations={getProjectRecommendations}
                  debounceMs={300}
                  minSearchLength={1}
                  loadingText="Loading…"
                  emptyText={projectError ?? 'No projects'}
                />
                {scope.projectKey ? (
                  <div className="text-xs text-gray-600">
                    Selected:{' '}
                    <span className="font-medium">{selectedProjectLabel}</span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Issue type</Label>
                <InputSearch<IssueTypeOption>
                  placeholder={issueTypePlaceholder}
                  value={scope.issueTypeId}
                  onSelect={handleSelectIssueType}
                  onSearch={searchIssueTypes}
                  getRecommendations={getIssueTypeRecommendations}
                  debounceMs={200}
                  minSearchLength={1}
                  loadingText="Loading…"
                  emptyText={issueTypeEmptyText}
                  disabled={isIssueTypeDisabled}
                />
                {scope.issueTypeName ? (
                  <div className="text-xs text-gray-600">
                    Selected:{' '}
                    <span className="font-medium">{scope.issueTypeName}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button asChild variant="secondary">
              <Link to="/templates">Cancel</Link>
            </Button>
            <Button onClick={() => setStep(2)} disabled={!canProceedToStep2}>
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border bg-white">
            <div className="border-b px-4 py-3">
              <div className="text-sm font-medium text-gray-900">Basics</div>
              <div className="text-xs text-gray-600">
                Name is required. Description is optional.
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Name</Label>
                  <Input
                    id="template-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Bug report"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scope</Label>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {scope.projectKey} • {scope.issueTypeName}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-desc">Description template</Label>
                <Textarea
                  id="template-desc"
                  value={descriptionTemplate}
                  onChange={(e) => setDescriptionTemplate(e.target.value)}
                  placeholder="Steps to reproduce…"
                />
              </div>

              {saveError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {saveError}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary">
                <Link to="/templates">Cancel</Link>
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={!canSave || isSaving}>
                {isSaving ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
