import { useCallback, useRef } from 'react'
import { Button } from '@internal/ui/components/button'
import { Link } from 'react-router-dom'

import { useWizardContext } from './context'
import { FieldsSection } from './FieldsSection'
import { ScopeSection } from './ScopeSection'

/* ------------------------------------------------------------------ */
/*  Auto-growing textarea (borderless, for inline editing)             */
/* ------------------------------------------------------------------ */

function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  className
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const handleInput = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={handleInput}
      placeholder={placeholder}
      className={className}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Template editor                                                    */
/* ------------------------------------------------------------------ */

export function TemplateEditor() {
  const { state, actions, meta } = useWizardContext()

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
          value={state.descriptionTemplate}
          onChange={actions.setDescriptionTemplate}
          placeholder="Add a description…"
          className="text-muted-foreground placeholder:text-muted-foreground/40 block w-full resize-none bg-transparent text-sm outline-none"
        />
      </div>

      {/* Scope */}
      <ScopeSection />

      {/* Fields (progressive disclosure) */}
      <FieldsSection />

      {/* Save error */}
      {state.saveError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.saveError}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button asChild variant="secondary">
          <Link to="/templates">Cancel</Link>
        </Button>
        <Button
          onClick={() => actions.save().catch(() => {})}
          disabled={!meta.canSave || state.isSaving}>
          {state.isSaving ? 'Creating…' : 'Create'}
        </Button>
      </div>
    </div>
  )
}
