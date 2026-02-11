import { useRef, useState } from 'react'
import { useMount } from 'ahooks'

import { ActionGroup, ActionList, ActionPanel } from '@/common/commands'
import { HotkeysScopeProvider, useHotkey } from '@/lib/hotkeys'

import { FieldConfirm } from './FieldConfirm'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useWizardNavigation } from './useWizardNavigation'

interface Props {
  focusField: 'summary' | 'description'
}

function SummaryDescriptionInputInner({ focusField }: Props) {
  const { values, setValue } = useCreateIssueDraftStore()
  const currentSummary = values['summary'] as string

  const [search, setSearch] = useState(currentSummary ?? '')
  const { goToNextField, goBackToFieldsMenu } = useWizardNavigation()

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [description, setDescription] = useState<string>(
    typeof values['description'] === 'string'
      ? (values['description'] as string)
      : ''
  )

  const focusOnDescription = () => {
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  // Pre-fill summary into the search box; shift focus if description was clicked
  useMount(() => {
    if (focusField === 'description') {
      focusOnDescription()
    }
  })

  const saveAndContinue = () => {
    setValue('summary', search)
    setValue('description', description)
    setSearch('')
    goToNextField()
  }

  useHotkey('field.confirm-complex', saveAndContinue)
  useHotkey('field-input.escape', goBackToFieldsMenu)

  return (
    <ActionPanel
      search={search}
      onSearchChange={setSearch}
      onSearchConfirm={focusOnDescription}
      searchPlaceholder="What's this about..."
      shouldFilter={false}>
      <ActionList emptyPlaceholder="">
        <ActionGroup heading="Description">
          <div className="p-3">
            <textarea
              ref={textareaRef}
              className="border-input bg-background focus-visible:ring-ring/50 min-h-[140px] w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type description…"
            />
          </div>
        </ActionGroup>

        <FieldConfirm onClick={saveAndContinue} />
      </ActionList>
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
