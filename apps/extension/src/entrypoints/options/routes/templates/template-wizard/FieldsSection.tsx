import { useCallback, useMemo, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@internal/ui/components/empty'
import { PlusIcon } from 'lucide-react'

import { LoadingCursor } from '@/components/LoadingCursor'
import { JiraFieldMetadata } from '@/repository/schema'
import type { FieldConfig } from '~/types/template'

import { AddFieldDialog } from './AddFieldDialog'
import { useWizardContext } from './context'
import { FieldRow } from './FieldRow'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const EXCLUDED = new Set(['project', 'issuetype', 'attachment', 'issuelinks'])
const PINNED = new Set(['summary', 'description'])

/* ------------------------------------------------------------------ */
/*  Fields section                                                     */
/* ------------------------------------------------------------------ */

export function FieldsSection() {
  const { state, actions } = useWizardContext()
  const {
    scope,
    availableFields,
    fieldsConfig,
    fieldsMap,
    areFieldsLoading,
    fieldsError
  } = state
  const [commandOpen, setCommandOpen] = useState(false)

  const { pinnedFields, reorderableFields, unconfiguredFields } =
    useMemo(() => {
      const fieldMetaMap = new Map(availableFields.map((f) => [f.fieldId, f]))

      const pinned: JiraFieldMetadata[] = []
      const reorderable: JiraFieldMetadata[] = []

      for (const config of fieldsConfig) {
        if (EXCLUDED.has(config.fieldId)) continue
        const f = fieldMetaMap.get(config.fieldId)
        if (!f) continue

        if (PINNED.has(config.fieldId)) {
          pinned.push(f)
        } else {
          reorderable.push(f)
        }
      }

      const configuredIds = new Set(fieldsConfig.map((c) => c.fieldId))
      const unconfigured = availableFields.filter(
        (f) => !EXCLUDED.has(f.fieldId) && !configuredIds.has(f.fieldId)
      )

      return {
        pinnedFields: pinned,
        reorderableFields: reorderable,
        unconfiguredFields: unconfigured
      }
    }, [availableFields, fieldsConfig])

  const allConfigured = [...pinnedFields, ...reorderableFields]

  const handleAddField = useCallback(
    (fieldId: string) => {
      actions.setFieldConfig({ fieldId, behavior: 'preset' })
      setCommandOpen(false)
    },
    [actions]
  )

  const handleConfigChange = useCallback(
    (config: FieldConfig) => {
      actions.setFieldConfig(config)
    },
    [actions]
  )

  const handleMoveUp = useCallback(
    (fieldId: string) => {
      const idx = fieldsConfig.findIndex((c) => c.fieldId === fieldId)
      if (idx <= 0) return
      // Find the previous non-pinned field
      let target = idx - 1
      while (target >= 0 && PINNED.has(fieldsConfig[target]!.fieldId)) {
        target--
      }
      if (target >= 0) actions.reorderFields(idx, target)
    },
    [actions, fieldsConfig]
  )

  const handleMoveDown = useCallback(
    (fieldId: string) => {
      const idx = fieldsConfig.findIndex((c) => c.fieldId === fieldId)
      if (idx < 0 || idx >= fieldsConfig.length - 1) return
      // Find the next non-pinned field
      let target = idx + 1
      while (
        target < fieldsConfig.length &&
        PINNED.has(fieldsConfig[target]!.fieldId)
      ) {
        target++
      }
      if (target < fieldsConfig.length) actions.reorderFields(idx, target)
    },
    [actions, fieldsConfig]
  )

  if (!scope.issueType || !scope.project) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">Fields</h3>
          <p className="text-muted-foreground text-xs">
            Add fields and configure how they behave during issue creation.
            Required fields left unconfigured will be prompted automatically.
          </p>
        </div>
        {!areFieldsLoading && !fieldsError && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCommandOpen(true)}
            disabled={unconfiguredFields.length === 0}>
            <PlusIcon className="size-3.5" />
            Add field
          </Button>
        )}
      </div>

      {areFieldsLoading && <LoadingCursor />}

      {!areFieldsLoading && fieldsError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load fields: {fieldsError}
        </div>
      )}

      {!areFieldsLoading && !fieldsError && (
        <>
          {allConfigured.length === 0 ? (
            <Empty className="border py-8">
              <EmptyHeader>
                <EmptyTitle className="text-sm">
                  No fields configured
                </EmptyTitle>
                <EmptyDescription>
                  Click &ldquo;Add field&rdquo; to include fields in this
                  template. Use Show for default behavior, Fill to auto-fill
                  values, or Limit to restrict available options.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-2">
              {pinnedFields.map((field) => (
                <FieldRow
                  key={field.fieldId}
                  project={scope.project!}
                  issueType={scope.issueType!}
                  field={field}
                  config={fieldsMap.get(field.fieldId)!}
                  onConfigChange={handleConfigChange}
                  onRemove={() => actions.removeFieldConfig(field.fieldId)}
                />
              ))}
              {reorderableFields.map((field, index) => (
                <FieldRow
                  key={field.fieldId}
                  project={scope.project!}
                  issueType={scope.issueType!}
                  field={field}
                  config={fieldsMap.get(field.fieldId)!}
                  onConfigChange={handleConfigChange}
                  onRemove={() => actions.removeFieldConfig(field.fieldId)}
                  onMoveUp={
                    index > 0 ? () => handleMoveUp(field.fieldId) : undefined
                  }
                  onMoveDown={
                    index < reorderableFields.length - 1
                      ? () => handleMoveDown(field.fieldId)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Add field command dialog */}
      <AddFieldDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        configuredFields={allConfigured}
        unconfiguredFields={unconfiguredFields}
        onSelect={handleAddField}
      />
    </section>
  )
}
