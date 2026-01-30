import * as React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'ahooks'

import type { SearchOption } from '@/components/ui'
import { JiraIssueType, JiraProject } from '@/types'
import { formatErrorMessage } from '@/utils/formatError'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'
import { getProjectService } from '~/services/project-service'
import { getTemplateService } from '~/services/template-service'
import { getTicketService } from '~/services/ticket-service'
import type { FieldConfig, FieldMetadata } from '~/types/template'

import { type Step, type WizardScope } from './types'

export type WizardState = {
  step: Step

  scope: WizardScope

  // Project picker
  projectQuery: string
  projectOptions: SearchOption<JiraProject>[]
  isProjectOptionsLoading: boolean
  projectError: string | null

  // Issue type picker
  issueTypeOptions: SearchOption<JiraIssueType>[]

  // Fields (Step 2)
  availableFields: FieldMetadata[]
  areFieldsLoading: boolean
  fieldsError: string | null
  fieldsConfig: Record<string, FieldConfig>

  // Basics (Step 3)
  name: string
  descriptionTemplate: string

  saveError: string | null
  isSaving: boolean
}

export type WizardActions = {
  goToStep: (step: Step) => void

  setProjectQuery: (query: string) => void
  selectProject: (opt: JiraProject | null) => void

  selectIssueType: (opt: JiraIssueType | null) => void

  setFieldConfig: (fieldId: string, config: FieldConfig) => void
  removeFieldConfig: (fieldId: string) => void

  setName: (next: string) => void
  setDescriptionTemplate: (next: string) => void

  save: () => Promise<void>
}

export type WizardMeta = {
  host: string
  canProceedToStep2: boolean
  canProceedToStep3: boolean
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

  const [scope, setScope] = useState<WizardScope>({})

  const [projectQuery, setProjectQuery] = useState('')

  const debouncedProjectQuery = useDebounce(projectQuery.trim(), {
    wait: 300,
    leading: false,
    trailing: true
  })

  const projectsQuery = useQuery<JiraProject[]>({
    queryKey: queryKeys.projects.recentOrSearch(debouncedProjectQuery),
    queryFn: async ({ queryKey }) => {
      const q = String(queryKey[2] ?? '').trim()
      const svc = getProjectService()
      return q.length === 0 ? svc.getRecentProjects() : svc.searchProjects(q)
    },
    staleTime: minutes(1),
    gcTime: minutes(5)
  })

  const projectOptions = useMemo<SearchOption<JiraProject>[]>(() => {
    const data = projectsQuery.data ?? []
    return data.map((proj) => ({
      value: proj.key,
      label: proj.name,
      data: proj
    }))
  }, [projectsQuery.data])

  const isProjectOptionsLoading = projectsQuery.isLoading
  const projectError = projectsQuery.error
    ? formatErrorMessage(projectsQuery.error)
    : null

  const issueTypeOptions = useMemo(() => {
    const { project } = scope
    if (!project) return []

    return project.issueTypes
      .filter((i) => !i.subtask)
      .map((issueType) => ({
        value: issueType.id,
        label: issueType.name,
        data: issueType
      }))
  }, [scope])

  // --- Step 2: Fields ---

  const fieldsQuery = useQuery({
    queryKey: queryKeys.tickets.createMeta(
      scope.project?.key ?? '',
      scope.issueType?.id ?? ''
    ),
    queryFn: async () => {
      if (!scope.project || !scope.issueType) return []
      const svc = getTicketService()
      return svc.getCreateIssueFields({
        projectIdOrKey: scope.project.key,
        issueTypeId: scope.issueType.id
      })
    },
    enabled: Boolean(scope.project && scope.issueType),
    staleTime: minutes(5)
  })

  const availableFields = useMemo(
    () => fieldsQuery.data ?? [],
    [fieldsQuery.data]
  )
  const areFieldsLoading = fieldsQuery.isLoading
  const fieldsError = fieldsQuery.error
    ? formatErrorMessage(fieldsQuery.error)
    : null

  // Reset fieldsConfig when scope changes (derive during render, not via effect)
  const scopeKey = `${scope.project?.key ?? ''}:${scope.issueType?.id ?? ''}`
  const prevScopeKeyRef = useRef(scopeKey)
  const [fieldsConfig, setFieldsConfig] = useState<Record<string, FieldConfig>>(
    {}
  )
  if (prevScopeKeyRef.current !== scopeKey) {
    prevScopeKeyRef.current = scopeKey
    setFieldsConfig({})
  }

  const setFieldConfig = useCallback((fieldId: string, config: FieldConfig) => {
    setFieldsConfig((prev) => ({
      ...prev,
      [fieldId]: config
    }))
  }, [])

  const removeFieldConfig = useCallback(
    (fieldId: string) => {
      // Guard: never ignore required fields
      const meta = availableFields.find((f) => f.fieldId === fieldId)
      if (meta?.required) return

      setFieldsConfig((prev) => ({
        ...prev,
        [fieldId]: { behavior: 'ignore', presetValue: undefined }
      }))
    },
    [availableFields]
  )

  // --- Step 3: Basics ---

  const [name, setName] = useState('')
  const [descriptionTemplate, setDescriptionTemplate] = useState('')

  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const canProceedToStep2 = Boolean(scope.project && scope.issueType)
  const canProceedToStep3 = true // Fields are optional/configurable

  const canSave = Boolean(name.trim()) && Boolean(host) && canProceedToStep2

  const isIssueTypeDisabled = !scope.project

  const issueTypePlaceholder = scope.project
    ? 'Search issue types…'
    : 'Select a project first…'

  const issueTypeEmptyText = scope.project
    ? 'No issue types'
    : 'No project selected'

  const selectProject = useCallback((project: JiraProject | null) => {
    if (!project) {
      setScope({})
      return
    }

    setScope((prev) => ({
      ...prev,
      project,
      issueType: project.key === prev.project?.key ? prev.issueType : undefined
    }))
  }, [])

  const selectIssueType = useCallback((issueType: JiraIssueType | null) => {
    setScope((prev) => ({
      ...prev,
      issueType: issueType ?? undefined
    }))
  }, [])

  const save = useCallback(async () => {
    setSaveError(null)
    setIsSaving(true)

    if (!scope.project || !scope.issueType) {
      return
    }

    try {
      const svc = getTemplateService()
      const created = await svc.createTemplate({
        name: name.trim(),
        icon: undefined,
        scope: {
          baseUrlHost: host,
          projectKey: scope.project.key,
          issueTypeId: scope.issueType.id,
          issueTypeName: scope.issueType.name
        },
        fields: {
          // Ensure required fields are always saved as visible
          ...Object.fromEntries(
            availableFields
              .filter((f) => f.required)
              .map((f) => [f.fieldId, { behavior: 'visible' as const }])
          ),
          ...fieldsConfig
        },
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
    availableFields,
    descriptionTemplate,
    fieldsConfig,
    host,
    name,
    onCreated,
    scope
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
      availableFields,
      areFieldsLoading,
      fieldsError,
      fieldsConfig,
      name,
      descriptionTemplate,
      saveError,
      isSaving
    }),
    [
      step,
      scope,
      projectQuery,
      projectOptions,
      isProjectOptionsLoading,
      projectError,
      issueTypeOptions,
      availableFields,
      areFieldsLoading,
      fieldsError,
      fieldsConfig,
      name,
      descriptionTemplate,
      saveError,
      isSaving
    ]
  )

  const actions = useMemo<WizardActions>(
    () => ({
      goToStep: setStep,
      setProjectQuery,
      selectProject,
      selectIssueType,
      setFieldConfig,
      removeFieldConfig,
      setName,
      setDescriptionTemplate,
      save
    }),
    [removeFieldConfig, save, selectIssueType, selectProject, setFieldConfig]
  )

  const meta = useMemo<WizardMeta>(
    () => ({
      host,
      canProceedToStep2,
      canProceedToStep3,
      canSave,
      isIssueTypeDisabled,
      issueTypePlaceholder,
      issueTypeEmptyText
    }),
    [
      canProceedToStep2,
      canProceedToStep3,
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
