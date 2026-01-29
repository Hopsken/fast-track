import { useMemo, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'
import { Input } from '@internal/ui/components/input'
import { Label } from '@internal/ui/components/label'
import { Textarea } from '@internal/ui/components/textarea'
import { Link, useNavigate } from 'react-router-dom'

import { useCurrentJiraHost } from '~/hooks/useCurrentJiraHost'
import { getProjectService } from '~/services/project-service'
import { getTemplateService } from '~/services/template-service'

type WizardScope = {
  projectKey: string
  issueTypeId: string
  issueTypeName: string
}

type ProjectOption = { key: string; name: string }
type IssueTypeOption = { id: string; name: string }

type Step = 1 | 2

export function TemplateWizardPage() {
  const navigate = useNavigate()
  const { host: currentHost, isLoading: hostLoading } = useCurrentJiraHost()

  const [step, setStep] = useState<Step>(1)

  const [projectQuery, setProjectQuery] = useState('')
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([])
  const [projectLoading, setProjectLoading] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)

  const [issueTypes, setIssueTypes] = useState<IssueTypeOption[]>([])
  const [issueTypesLoading, setIssueTypesLoading] = useState(false)
  const [issueTypesError, setIssueTypesError] = useState<string | null>(null)

  const [scope, setScope] = useState<WizardScope>({
    projectKey: '',
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

  const selectedProjectLabel = useMemo(() => {
    const p = projectOptions.find((p) => p.key === scope.projectKey)
    return p ? `${p.key} — ${p.name}` : scope.projectKey
  }, [projectOptions, scope.projectKey])

  async function runProjectSearch(query: string) {
    setProjectError(null)
    setProjectLoading(true)
    try {
      const svc = getProjectService()
      const results = query.trim()
        ? await svc.searchProjects(query)
        : await svc.searchProjects('')
      setProjectOptions(results)
    } catch (e) {
      setProjectError(e instanceof Error ? e.message : String(e))
    } finally {
      setProjectLoading(false)
    }
  }

  async function loadIssueTypes(projectKey: string) {
    setIssueTypesError(null)
    setIssueTypesLoading(true)
    try {
      const svc = getProjectService()
      const results = await svc.getProjectIssueTypes(projectKey)
      setIssueTypes(results)
    } catch (e) {
      setIssueTypesError(e instanceof Error ? e.message : String(e))
    } finally {
      setIssueTypesLoading(false)
    }
  }

  async function handleSelectProject(project: ProjectOption) {
    setScope({ projectKey: project.key, issueTypeId: '', issueTypeName: '' })
    setIssueTypes([])
    await loadIssueTypes(project.key)
  }

  function handleSelectIssueType(it: IssueTypeOption) {
    setScope((s) => ({
      ...s,
      issueTypeId: it.id,
      issueTypeName: it.name
    }))
  }

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
                <div className="rounded-md border">
                  <Command>
                    <CommandInput
                      placeholder="Search projects…"
                      value={projectQuery}
                      onValueChange={(v) => {
                        setProjectQuery(v)
                        void runProjectSearch(v)
                      }}
                    />
                    <CommandList>
                      {projectLoading ? (
                        <CommandLoading>Loading…</CommandLoading>
                      ) : null}
                      {!projectLoading && projectError ? (
                        <CommandEmpty>{projectError}</CommandEmpty>
                      ) : null}
                      {!projectLoading && !projectError ? (
                        <CommandEmpty>No projects</CommandEmpty>
                      ) : null}
                      <CommandGroup>
                        {projectOptions.map((p) => (
                          <CommandItem
                            key={p.key}
                            value={`${p.key} ${p.name}`}
                            onSelect={() => void handleSelectProject(p)}>
                            {p.key} — {p.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
                {scope.projectKey ? (
                  <div className="text-xs text-gray-600">
                    Selected:{' '}
                    <span className="font-medium">{selectedProjectLabel}</span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Issue type</Label>
                <div className="rounded-md border">
                  <Command>
                    <CommandInput
                      placeholder={
                        scope.projectKey
                          ? 'Search issue types…'
                          : 'Select a project first…'
                      }
                      disabled={!scope.projectKey}
                    />
                    <CommandList>
                      {issueTypesLoading ? (
                        <CommandLoading>Loading…</CommandLoading>
                      ) : null}
                      {!issueTypesLoading && issueTypesError ? (
                        <CommandEmpty>{issueTypesError}</CommandEmpty>
                      ) : null}
                      {!issueTypesLoading && !issueTypesError ? (
                        <CommandEmpty>
                          {scope.projectKey
                            ? 'No issue types'
                            : 'No project selected'}
                        </CommandEmpty>
                      ) : null}
                      <CommandGroup>
                        {issueTypes.map((it) => (
                          <CommandItem
                            key={it.id}
                            value={it.name}
                            onSelect={() => handleSelectIssueType(it)}>
                            {it.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
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
