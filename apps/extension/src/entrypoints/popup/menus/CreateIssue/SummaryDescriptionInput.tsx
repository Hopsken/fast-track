import { useRef, useState } from 'react'
import { useMount } from 'ahooks'

import { CommandGroup, CommandList, ActionPanel } from '@/common/commands'
import { HotkeysScopeProvider, useHotkey } from '@/lib/hotkeys'

import { FieldConfirm } from './FieldConfirm'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useWizardNavigation } from './useWizardNavigation'

interface Props {
  focusField: 'summary' | 'description'
}

function SummaryDescriptionInputInner({ focusField }: Props) {
  const { values, setValue } = useCreateIssueDraftStore()
  const currentSummary = values['summary']

  const [search, setSearch] = useState(currentSummary)
  const { goToNextField } = useWizardNavigation()

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [description, setDescription] = useState<string>(
    typeof values['description'] === 'string'
      ? (values['description'] as string)
      : ''
  )

  // Pre-fill summary into the search box; shift focus if description was clicked
  useMount(() => {
    if (focusField === 'description') {
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  })

  const saveAndContinue = () => {
    setValue('summary', search)
    setValue('description', description)
    setSearch('')
    goToNextField()
  }

  useHotkey('field.confirm-complex', saveAndContinue)

  return (
    <ActionPanel searchPlaceholder="What's this about..." shouldFilter={false}>
      <CommandList emptyPlaceholder="">
        <CommandGroup heading="Description">
          <div className="p-3">
            <textarea
              ref={textareaRef}
              className="border-input bg-background focus-visible:ring-ring/50 min-h-[140px] w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type description…"
            />
          </div>
        </CommandGroup>

        <FieldConfirm onClick={saveAndContinue} />
      </CommandList>
    </ActionPanel>
  )
}

export function SummaryDescriptionInput({ focusField }: Props) {
  return (
    <HotkeysScopeProvider scope="field-input">
      <SummaryDescriptionInputInner focusField={focusField} />
    </HotkeysScopeProvider>
  )
}
