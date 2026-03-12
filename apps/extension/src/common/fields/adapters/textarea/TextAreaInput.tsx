import { useEffect, useRef } from 'react'
import { ZodString } from 'zod'

import { ActionGroup, ActionList, ActionPanel } from '@/common/commands'
import type { FieldInputComponentProps } from '@/common/fields/types'

/** Multiline text input for Jira textarea custom fields. */
export function TextAreaInput(props: FieldInputComponentProps<ZodString>) {
  const { adapter, context, value, onChange } = props

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // ActionSearch autoFocus focuses the (readonly) search input.
    // For long-text fields, focus the textarea instead.
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [])

  const title = adapter.title ?? context.metadata.name
  const current = typeof value === 'string' ? value : ''

  return (
    <ActionPanel searchReadonly shouldFilter={false} searchPlaceholder={title}>
      <ActionList emptyPlaceholder="">
        <ActionGroup heading={title}>
          <div className="p-3">
            <textarea
              ref={textareaRef}
              className="border-input bg-background focus-visible:ring-ring/50 min-h-[140px] w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
              value={current}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Type ${title.toLowerCase()}…`}
            />
          </div>
        </ActionGroup>
      </ActionList>
    </ActionPanel>
  )
}
