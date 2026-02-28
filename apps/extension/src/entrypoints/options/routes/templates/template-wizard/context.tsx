import * as React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounce, useMemoizedFn } from 'ahooks'

import type { SearchOption } from '@/components/ui'
import { extractLeadingEmoji } from '@/lib/emoji'
import { JiraFieldMetadata } from '@/repository/schema'
import { getJiraService } from '@/services'
import { JiraIssueType, JiraProject } from '@/types'
import { formatErrorMessage } from '@/utils/formatError'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'
import { getTemplateService } from '~/services/template-service'
import type {
  FieldConfig,
  IssueTemplate,
  IssueTemplateScope
} from '~/types/template'

type WizardScope = Partial<Omit<IssueTemplateScope, 'baseUrlHost'>>

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
  availableFields: JiraFieldMetadata[]
  areFieldsLoading: boolean
  fieldsError: string | null
  fieldsConfig: FieldConfig[]
  fieldsMap: Map<string, FieldConfig>

  // Basics
  name: string
  description: string

  saveError: string | null
  isSaving: boolean
  isDeleting: boolean
}

export type WizardActions = {
  setProjectQuery: (query: string) => void
  selectProject: (opt: JiraProject | null) => void
  selectIssueType: (opt: JiraIssueType | null) => void

  setFieldConfig: (config: FieldConfig) => void
  removeFieldConfig: (fieldId: string) => void
  reorderFields: (fromIndex: number, toIndex: number) => void

  setName: (next: string) => void
  setDescription: (next: string) => void

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
  const queryClient = useQueryClient()

  const isEdit = mode === 'edit'
  const existingTemplate = isEdit ? props.template : null

  // ------ Scope ------

  const [scope, setScope] = useState<WizardScope>(() =>
    existingTemplate ? existingTemplate.scope : {}
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
      const projectService = getJiraService().projects
      return q.length === 0
        ? projectService.getRecentProjects()
        : projectService.searchProjects(q)
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

    return (
      project.issueTypes
        ?.filter((i) => !i.subtask)
        .map((issueType) => ({
          value: issueType.id,
          label: issueType.name,
          data: issueType
        })) ?? []
    )
  }, [scope])

  // --- Fields ---

  const hasScope = Boolean(scope.project && scope.issueType)
  const projectKey = scope.project?.key ?? ''
  const issueTypeId = scope.issueType?.id ?? ''

  const fieldsQuery = useQuery({
    queryKey: queryKeys.tickets.createMeta(projectKey, issueTypeId),
    queryFn: async () => {
      if (!projectKey || !issueTypeId) return []
      return getJiraService().issues.getCreateIssueMetaFields({
        projectIdOrKey: projectKey,
        issueTypeId: issueTypeId
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
  const [fieldsConfig, setFieldsConfig] = useState<FieldConfig[]>(
    () => existingTemplate?.fields ?? []
  )

  const fieldsMap = useMemo(
    () => new Map(fieldsConfig.map((c) => [c.fieldId, c])),
    [fieldsConfig]
  )

  useEffect(() => {
    if (!isEdit) setFieldsConfig([])
  }, [scopeKey, isEdit])

  const setFieldConfig = useCallback((config: FieldConfig) => {
    setFieldsConfig((prev) => {
      const idx = prev.findIndex((c) => c.fieldId === config.fieldId)
      if (idx >= 0) {
        const next = prev.slice()
        next[idx] = config
        return next
      }
      return [...prev, config]
    })
  }, [])

  const removeFieldConfig = useCallback((fieldId: string) => {
    setFieldsConfig((prev) => prev.filter((c) => c.fieldId !== fieldId))
  }, [])

  const reorderFields = useCallback((fromIndex: number, toIndex: number) => {
    setFieldsConfig((prev) => {
      const next = prev.slice()
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved!)
      return next
    })
  }, [])

  // --- Basics ---

  const [name, setName] = useState(() => {
    if (existingTemplate) {
      return existingTemplate.icon
        ? `${existingTemplate.icon} ${existingTemplate.name}`
        : existingTemplate.name
    }
    return ''
  })
  const [description, setDescription] = useState(
    () => existingTemplate?.description ?? ''
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

  const save = useMemoizedFn(async () => {
    setSaveError(null)
    setIsSaving(true)

    if (!scope.project || !scope.issueType) return

    // Validate field configurations
    const validationErrors: string[] = []
    const fieldMap = new Map(availableFields.map((f) => [f.fieldId, f]))

    for (const config of fieldsConfig) {
      const field = fieldMap.get(config.fieldId)
      const fieldName = field?.name ?? config.fieldId

      if (config.behavior === 'restricted') {
        // Restricted must have at least one option
        if (!config.allowedOptions || config.allowedOptions.length === 0) {
          validationErrors.push(
            `${fieldName}: At least one option required for restricted mode.`
          )
        }
      }

      // TU-56 (date): Block saving when preset/restricted contains an invalid date expression.
      // We validate only for fields we know are `schema.type === 'date'`.
      if (field?.schema?.type === 'date') {
        // Import lazily to avoid pulling chrono into unrelated code paths.
        const { parseSemanticDateValue } = await import(
          '@/common/fields/adapters/shared/date/dateParsing'
        )

        const invalidValues: string[] = []

        if (config.behavior === 'preset') {
          if (typeof config.presetValue === 'string') {
            const raw = config.presetValue.trim()
            if (raw) {
              const parsed = parseSemanticDateValue(raw)
              if (parsed.status === 'invalid') invalidValues.push(raw)
            }
          }
        }

        if (config.behavior === 'restricted') {
          for (const opt of config.allowedOptions ?? []) {
            if (typeof opt !== 'string') continue
            const raw = opt.trim()
            if (!raw) continue
            const parsed = parseSemanticDateValue(raw)
            if (parsed.status === 'invalid') invalidValues.push(raw)
          }
        }

        if (invalidValues.length > 0) {
          validationErrors.push(
            `${fieldName}: Invalid date preset value(s): ${invalidValues.join(', ')}`
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
      const { emoji, rest: newName } = extractLeadingEmoji(name.trim())

      if (isEdit && existingTemplate) {
        await svc.updateTemplate(existingTemplate.id, {
          name: newName,
          icon: emoji,
          fields: fieldsConfig,
          description: description.trim()
        })
        props.onSaved()
      } else {
        const created = await svc.createTemplate({
          name: newName,
          icon: emoji,
          scope: {
            baseUrlHost: host,
            project: scope.project,
            issueType: scope.issueType
          },
          fields: fieldsConfig,
          description: description.trim()
        })
        ;(props as { onCreated: (id: string) => void })?.onCreated(created.id)
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.issueTemplates.list(false)
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.issueTemplates.list(true)
      })
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsSaving(false)
    }
  })

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
      fieldsMap,
      name,
      description: description,
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
      fieldsMap,
      name,
      description,
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
      reorderFields,
      setName,
      setDescription: setDescription,
      save,
      deleteTemplate: isEdit ? deleteTemplate : null
    }),
    [
      deleteTemplate,
      isEdit,
      reorderFields,
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
            projectKey: existingTemplate.scope.project.key,
            issueTypeName: existingTemplate.scope.issueType.name
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
