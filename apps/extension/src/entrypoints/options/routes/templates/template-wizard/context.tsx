import * as React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'

import type { SearchOption } from '@/components/ui'
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

  projectError: string | null

  issueTypes: IssueTypeOption[]
  issueTypesLoading: boolean
  issueTypesError: string | null

  scope: WizardScope

  name: string
  descriptionTemplate: string

  saveError: string | null
  isSaving: boolean
}

export type WizardActions = {
  goToStep: (step: Step) => void

  selectProject: (opt: SearchOption<ProjectOption> | null) => Promise<void>
  selectIssueType: (opt: SearchOption<IssueTypeOption> | null) => void

  searchProjects: (query: string) => Promise<SearchOption<ProjectOption>[]>
  getProjectRecommendations: () => Promise<SearchOption<ProjectOption>[]>

  searchIssueTypes: (query: string) => Promise<SearchOption<IssueTypeOption>[]>
  getIssueTypeRecommendations: () => Promise<SearchOption<IssueTypeOption>[]>

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

  const canSave = Boolean(name.trim()) && Boolean(host) && canProceedToStep2

  const isIssueTypeDisabled = !scope.projectKey || issueTypesLoading

  const issueTypePlaceholder = (() => {
    if (!scope.projectKey) return 'Select a project first…'
    if (issueTypesLoading) return 'Loading issue types…'
    return 'Search issue types…'
  })()

  const issueTypeEmptyText =
    issueTypesError ??
    (scope.projectKey ? 'No issue types' : 'No project selected')

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

  const selectProject = useCallback(
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
      projectError,
      issueTypes,
      issueTypesLoading,
      issueTypesError,
      scope,
      name,
      descriptionTemplate,
      saveError,
      isSaving
    }),
    [
      descriptionTemplate,
      isSaving,
      issueTypes,
      issueTypesError,
      issueTypesLoading,
      name,
      projectError,
      saveError,
      scope,
      step
    ]
  )

  const actions = useMemo<WizardActions>(
    () => ({
      goToStep: setStep,
      selectProject,
      selectIssueType,
      searchProjects,
      getProjectRecommendations,
      searchIssueTypes,
      getIssueTypeRecommendations,
      setName,
      setDescriptionTemplate,
      save
    }),
    [
      getIssueTypeRecommendations,
      getProjectRecommendations,
      save,
      searchIssueTypes,
      searchProjects,
      selectIssueType,
      selectProject
    ]
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
