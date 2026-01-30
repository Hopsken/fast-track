import * as React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

import { type WizardScope } from './types'

export type WizardState = {
  scope: WizardScope

  // Project picker
  projectQuery: string
  projectOptions: SearchOption<JiraProject>[]
  isProjectOptionsLoading: boolean
  projectError: string | null

  // Issue type picker
  issueTypeOptions: SearchOption<JiraIssueType>[]

  // Fields
  availableFields: FieldMetadata[]
  areFieldsLoading: boolean
  fieldsError: string | null
  fieldsConfig: Record<string, FieldConfig>

  // Basics
  name: string
  descriptionTemplate: string

  saveError: string | null
  isSaving: boolean
}

export type WizardActions = {
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
  hasScope: boolean
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

  // --- Fields ---

  const hasScope = Boolean(scope.project && scope.issueType)

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
    enabled: hasScope,
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

  // Reset fieldsConfig when scope changes
  const scopeKey = `${scope.project?.key ?? ''}:${scope.issueType?.id ?? ''}`
  const [fieldsConfig, setFieldsConfig] = useState<Record<string, FieldConfig>>(
    {}
  )

  useEffect(() => {
    setFieldsConfig({})
  }, [scopeKey])

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

  // --- Basics ---

  const [name, setName] = useState('')
  const [descriptionTemplate, setDescriptionTemplate] = useState('')

  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const canSave = Boolean(name.trim()) && Boolean(host) && hasScope

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

  const wizardMeta = useMemo<WizardMeta>(
    () => ({
      host,
      hasScope,
      canSave,
      isIssueTypeDisabled,
      issueTypePlaceholder,
      issueTypeEmptyText
    }),
    [
      canSave,
      hasScope,
      host,
      isIssueTypeDisabled,
      issueTypeEmptyText,
      issueTypePlaceholder
    ]
  )

  const value = useMemo<WizardContextValue>(
    () => ({ state, actions, meta: wizardMeta }),
    [actions, wizardMeta, state]
  )

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  )
}
