import * as React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'ahooks'

import type { SearchOption } from '@/components/ui'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'
import { getProjectService } from '~/services/project-service'
import { getTemplateService } from '~/services/template-service'

import {
  type IssueTypeOption,
  type ProjectOption,
  type Step,
  type WizardScope,
  toIssueTypeSearchOption,
  toProjectSearchOption
} from './types'

export type WizardState = {
  step: Step

  scope: WizardScope

  // Project picker
  projectQuery: string
  projectOptions: SearchOption<ProjectOption>[]
  isProjectOptionsLoading: boolean
  projectError: string | null

  // Issue type picker
  issueTypeOptions: SearchOption<IssueTypeOption>[]

  name: string
  descriptionTemplate: string

  saveError: string | null
  isSaving: boolean
}

export type WizardActions = {
  goToStep: (step: Step) => void

  setProjectQuery: (query: string) => void
  setProjectOpen: (open: boolean) => void
  selectProject: (opt: SearchOption<ProjectOption> | null) => Promise<void>

  selectIssueType: (opt: SearchOption<IssueTypeOption> | null) => void

  setName: (next: string) => void
  setDescriptionTemplate: (next: string) => void

  save: () => Promise<void>
}

export type WizardMeta = {
  host: string
  canProceedToStep2: boolean
  canSave: boolean

  isIssueTypeDisabled: boolean
  issueTypePlaceholder: string
  issueTypeEmptyText: string
}

export type WizardContextValue = {
  state: WizardState
  actions: WizardActions
  meta: WizardMeta
}

const WizardContext = createContext<WizardContextValue | null>(null)

export function useWizardContext() {
  const ctx = useContext(WizardContext)
  if (!ctx) {
    throw new Error(
      'TemplateWizard.* must be used within <TemplateWizard.Provider>'
    )
  }
  return ctx
}

type ProviderProps = {
  host: string
  onCreated: (templateId: string) => void
  children: React.ReactNode
}

export function TemplateWizardProvider({
  host,
  onCreated,
  children
}: ProviderProps) {
  const [step, setStep] = useState<Step>(1)

  const [scope, setScope] = useState<WizardScope>({
    projectKey: '',
    projectName: '',
    issueTypeId: '',
    issueTypeName: ''
  })

  // Controlled pickers
  const [isProjectOpen, setProjectOpen] = useState(false)
  const [projectQuery, setProjectQuery] = useState('')

  const debouncedProjectQuery = useDebounce(projectQuery.trim(), {
    wait: 300,
    leading: false,
    trailing: true
  })

  const projectsQuery = useQuery<ProjectOption[]>({
    queryKey: queryKeys.projects.recentOrSearch(debouncedProjectQuery),
    queryFn: async ({ queryKey }) => {
      const q = String(queryKey[2] ?? '').trim()
      const svc = getProjectService()
      return q.length === 0 ? svc.getRecentProjects() : svc.searchProjects(q)
    },
    // Always enabled so users see results instantly when opening the picker.
    staleTime: minutes(1),
    gcTime: minutes(5)
  })

  const projectOptions = useMemo(() => {
    const data = projectsQuery.data ?? []
    return data.map(toProjectSearchOption)
  }, [projectsQuery.data])

  const isProjectOptionsLoading = projectsQuery.isFetching && isProjectOpen

  const projectError =
    projectsQuery.error instanceof Error
      ? projectsQuery.error.message
      : projectsQuery.error
        ? String(projectsQuery.error)
        : null

  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(
    null
  )

  const issueTypes = useMemo<IssueTypeOption[]>(() => {
    if (!selectedProject) return []

    // Issue types are already included in the project payload.
    // Only allow selecting non-subtask issue types.
    return (selectedProject.issueTypes ?? [])
      .filter((it) => !it.subtask)
      .map((it) => ({ id: it.id, name: it.name, subtask: it.subtask }))
  }, [selectedProject])

  const issueTypeOptions = useMemo(() => {
    return issueTypes.map(toIssueTypeSearchOption)
  }, [issueTypes])

  const [name, setName] = useState('')
  const [descriptionTemplate, setDescriptionTemplate] = useState('')

  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const canProceedToStep2 = Boolean(
    scope.projectKey && scope.issueTypeId && scope.issueTypeName
  )

  const canSave = Boolean(name.trim()) && Boolean(host) && canProceedToStep2

  const isIssueTypeDisabled = !scope.projectKey

  const issueTypePlaceholder = scope.projectKey
    ? 'Search issue types…'
    : 'Select a project first…'

  const issueTypeEmptyText = scope.projectKey
    ? 'No issue types'
    : 'No project selected'

  const selectProject = useCallback(
    async (opt: SearchOption<ProjectOption> | null) => {
      if (!opt) {
        setScope({
          projectKey: '',
          projectName: '',
          issueTypeId: '',
          issueTypeName: ''
        })
        setSelectedProject(null)
        return
      }

      const project: ProjectOption =
        opt.data ??
        ({ key: opt.value, name: opt.label, issueTypes: [] } as ProjectOption)

      setSelectedProject(project)

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

      // Reset issue type selection when project changes.
    },
    []
  )

  const selectIssueType = useCallback(
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

  const save = useCallback(async () => {
    setSaveError(null)
    setIsSaving(true)

    try {
      const svc = getTemplateService()
      const created = await svc.createTemplate({
        name: name.trim(),
        icon: undefined,
        scope: {
          baseUrlHost: host,
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

      onCreated(created.id)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSaving(false)
    }
  }, [
    descriptionTemplate,
    host,
    name,
    onCreated,
    scope.issueTypeId,
    scope.issueTypeName,
    scope.projectKey
  ])

  const state = useMemo<WizardState>(
    () => ({
      step,
      scope,
      projectQuery,
      projectOptions,
      isProjectOptionsLoading,
      projectError,
      issueTypeOptions,
      name,
      descriptionTemplate,
      saveError,
      isSaving
    }),
    [
      descriptionTemplate,
      isProjectOptionsLoading,
      isSaving,
      issueTypeOptions,
      name,
      projectError,
      projectOptions,
      projectQuery,
      saveError,
      scope,
      step
    ]
  )

  const actions = useMemo<WizardActions>(
    () => ({
      goToStep: setStep,

      setProjectQuery,
      setProjectOpen,
      selectProject,

      selectIssueType,

      setName,
      setDescriptionTemplate,
      save
    }),
    [save, selectIssueType, selectProject]
  )

  const meta = useMemo<WizardMeta>(
    () => ({
      host,
      canProceedToStep2,
      canSave,
      isIssueTypeDisabled,
      issueTypePlaceholder,
      issueTypeEmptyText
    }),
    [
      canProceedToStep2,
      canSave,
      host,
      isIssueTypeDisabled,
      issueTypeEmptyText,
      issueTypePlaceholder
    ]
  )

  const value = useMemo<WizardContextValue>(
    () => ({ state, actions, meta }),
    [actions, meta, state]
  )

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  )
}
