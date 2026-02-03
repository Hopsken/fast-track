import { useMemo, useState } from 'react'
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
import { Separator } from '@internal/ui/components/separator'
import { Link } from 'react-router-dom'

import { AutoGrowTextarea } from '@/components/ui/AutoGrowTextArea'

import { useWizardContext } from './context'
import { FieldsSection } from './FieldsSection'
import { ScopeSection } from './ScopeSection'

/* ------------------------------------------------------------------ */
/*  Delete confirmation dialog                                         */
/* ------------------------------------------------------------------ */

function DeleteDialog({
  onConfirm,
  isDeleting
}: {
  onConfirm: () => void
  isDeleting: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isDeleting}>
          {isDeleting ? 'Deleting…' : 'Delete'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete template?</AlertDialogTitle>
          <AlertDialogDescription>
            This action can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Template editor                                                    */
/* ------------------------------------------------------------------ */

export function TemplateEditor() {
  const { state, actions, meta } = useWizardContext()

  const isEdit = meta.mode === 'edit'

  const buttonText = useMemo(() => {
    if (state.isSaving) {
      return isEdit ? 'Saving…' : 'Creating…'
    }
    return isEdit ? 'Save' : 'Create'
  }, [state.isSaving, isEdit])

  return (
    <div className="space-y-8">
      {/* Inline name + description (Linear-style) */}
      <div className="space-y-1">
        <input
          type="text"
          value={state.name}
          onChange={(e) => actions.setName(e.target.value)}
          placeholder="Template name"
          className="text-foreground placeholder:text-muted-foreground/50 block w-full bg-transparent text-xl font-semibold outline-none"
          autoFocus
        />
        <AutoGrowTextarea
          value={state.description}
          onChange={actions.setDescription}
          placeholder="Add a description…"
          className="text-muted-foreground placeholder:text-muted-foreground/40 block w-full resize-none bg-transparent text-sm outline-none"
        />
      </div>

      {/* Scope */}
      <ScopeSection />

      {meta.hasScope && (
        <>
          <Separator />
          {/* Fields (progressive disclosure) */}
          <FieldsSection />
        </>
      )}

      {/* Save error */}
      {state.saveError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.saveError}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 pt-4">
        {/* Delete button (edit mode only, left-aligned) */}
        {isEdit && actions.deleteTemplate && (
          <DeleteDialog
            onConfirm={() => {
              actions.deleteTemplate?.()
            }}
            isDeleting={state.isDeleting}
          />
        )}

        <div className="flex-1" />

        <Button asChild variant="secondary">
          <Link to="/templates">{isEdit ? 'Back' : 'Cancel'}</Link>
        </Button>
        <Button
          onClick={() => actions.save().catch(() => {})}
          disabled={!meta.canSave || state.isSaving}>
          {buttonText}
        </Button>
      </div>
    </div>
  )
}
