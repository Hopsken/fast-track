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
import type {
  FieldConfig,
  FieldMetadata,
  IssueTemplate
} from '~/types/template'

import { type WizardScope } from './types'

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

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
  isDeleting: boolean
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
  deleteTemplate: (() => Promise<void>) | null
}

export type WizardMeta = {
  host: string
  hasScope: boolean
  canSave: boolean
  mode: 'create' | 'edit'

  // Scope picker helpers (create mode)
  isIssueTypeDisabled: boolean
  issueTypePlaceholder: string
  issueTypeEmptyText: string

  // Scope display (edit mode)
  scopeDisplay: { projectKey: string; issueTypeName: string } | null
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Build a synthetic WizardScope from a persisted template. */
function scopeFromTemplate(template: IssueTemplate): WizardScope {
  return {
    project: {
      id: '',
      key: template.scope.projectKey,
      name: template.scope.projectKey,
      issueTypes: []
    },
    issueType: {
      id: template.scope.issueTypeId,
      name: template.scope.issueTypeName,
      iconUrl: '',
      description: ''
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

type ProviderProps = {
  host: string
  children: React.ReactNode
} & (
  | { mode: 'create'; onCreated: (templateId: string) => void }
  | {
      mode: 'edit'
      template: IssueTemplate
      onSaved: () => void
      onDeleted: () => void
    }
)

export function TemplateWizardProvider(props: ProviderProps) {
  const { host, children, mode } = props

  const isEdit = mode === 'edit'
  const existingTemplate = isEdit ? props.template : null

  // ------ Scope ------

  const [scope, setScope] = useState<WizardScope>(() =>
    existingTemplate ? scopeFromTemplate(existingTemplate) : {}
  )

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
    gcTime: minutes(5),
    // Skip fetching projects in edit mode — scope is locked
    enabled: !isEdit
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

  // Reset fieldsConfig when scope changes (create mode only)
  const scopeKey = `${scope.project?.key ?? ''}:${scope.issueType?.id ?? ''}`
  const [fieldsConfig, setFieldsConfig] = useState<Record<string, FieldConfig>>(
    () => existingTemplate?.fields ?? {}
  )

  useEffect(() => {
    if (!isEdit) setFieldsConfig({})
  }, [scopeKey, isEdit])

  const setFieldConfig = useCallback((fieldId: string, config: FieldConfig) => {
    setFieldsConfig((prev) => ({
      ...prev,
      [fieldId]: config
    }))
  }, [])

  const removeFieldConfig = useCallback((fieldId: string) => {
    setFieldsConfig((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  // --- Basics ---

  const [name, setName] = useState(() => existingTemplate?.name ?? '')
  const [descriptionTemplate, setDescriptionTemplate] = useState(
    () => existingTemplate?.descriptionTemplate ?? ''
  )

  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const canSave = Boolean(name.trim()) && Boolean(host) && hasScope

  const isIssueTypeDisabled = !scope.project

  const issueTypePlaceholder = scope.project
    ? 'Search issue types…'
    : 'Select a project first…'

  const issueTypeEmptyText = scope.project
    ? 'No issue types'
    : 'No project selected'

  const selectProject = useCallback(
    (project: JiraProject | null) => {
      if (isEdit) return // scope locked in edit mode
      if (!project) {
        setScope({})
        return
      }

      setScope((prev) => ({
        ...prev,
        project,
        issueType:
          project.key === prev.project?.key ? prev.issueType : undefined
      }))
    },
    [isEdit]
  )

  const selectIssueType = useCallback(
    (issueType: JiraIssueType | null) => {
      if (isEdit) return // scope locked in edit mode
      setScope((prev) => ({
        ...prev,
        issueType: issueType ?? undefined
      }))
    },
    [isEdit]
  )

  // --- Save ---

  const save = useCallback(async () => {
    setSaveError(null)
    setIsSaving(true)

    if (!scope.project || !scope.issueType) return

    // Validate field configurations
    const validationErrors: string[] = []
    const fieldMap = new Map(availableFields.map((f) => [f.fieldId, f]))

    for (const [fieldId, config] of Object.entries(fieldsConfig)) {
      const field = fieldMap.get(fieldId)
      const fieldName = field?.name ?? fieldId

      if (config.behavior === 'preset') {
        // Preset must have a value
        if (
          config.presetValue === undefined ||
          config.presetValue === null ||
          config.presetValue === ''
        ) {
          validationErrors.push(
            `${fieldName}: Preset value required. Set a value or switch to "Show" mode.`
          )
        }
      } else if (config.behavior === 'restricted') {
        // Restricted must have at least one option
        if (!config.allowedOptions || config.allowedOptions.length === 0) {
          validationErrors.push(
            `${fieldName}: At least one option required for restricted mode.`
          )
        }
      }
    }

    if (validationErrors.length > 0) {
      setSaveError(
        validationErrors.length === 1
          ? validationErrors[0]!
          : `${validationErrors.length} validation errors:\n${validationErrors.join('\n')}`
      )
      setIsSaving(false)
      return
    }

    try {
      const svc = getTemplateService()

      if (isEdit && existingTemplate) {
        await svc.updateTemplate(existingTemplate.id, {
          name: name.trim(),
          fields: fieldsConfig,
          descriptionTemplate: descriptionTemplate.trim()
            ? descriptionTemplate
            : undefined
        })
        props.onSaved()
      } else {
        const created = await svc.createTemplate({
          name: name.trim(),
          icon: undefined,
          scope: {
            baseUrlHost: host,
            projectKey: scope.project.key,
            issueTypeId: scope.issueType.id,
            issueTypeName: scope.issueType.name
          },
          fields: fieldsConfig,
          descriptionTemplate: descriptionTemplate.trim()
            ? descriptionTemplate
            : undefined,
          lastUsedAt: undefined
        })
        ;(props as { onCreated: (id: string) => void }).onCreated(created.id)
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSaving(false)
    }
  }, [
    availableFields,
    descriptionTemplate,
    existingTemplate,
    fieldsConfig,
    host,
    isEdit,
    name,
    props,
    scope
  ])

  // --- Delete (edit mode only) ---

  const deleteTemplate = useCallback(async () => {
    if (!existingTemplate) return
    setIsDeleting(true)
    try {
      const svc = getTemplateService()
      await svc.deleteTemplate(existingTemplate.id)
      ;(props as { onDeleted: () => void }).onDeleted()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsDeleting(false)
    }
  }, [existingTemplate, props])

  // --- Context value ---

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
      isSaving,
      isDeleting
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
      isSaving,
      isDeleting
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
      save,
      deleteTemplate: isEdit ? deleteTemplate : null
    }),
    [
      deleteTemplate,
      isEdit,
      removeFieldConfig,
      save,
      selectIssueType,
      selectProject,
      setFieldConfig
    ]
  )

  const wizardMeta = useMemo<WizardMeta>(
    () => ({
      host,
      hasScope,
      canSave,
      mode,
      isIssueTypeDisabled,
      issueTypePlaceholder,
      issueTypeEmptyText,
      scopeDisplay: existingTemplate
        ? {
            projectKey: existingTemplate.scope.projectKey,
            issueTypeName: existingTemplate.scope.issueTypeName
          }
        : null
    }),
    [
      canSave,
      existingTemplate,
      hasScope,
      host,
      isIssueTypeDisabled,
      issueTypeEmptyText,
      issueTypePlaceholder,
      mode
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
