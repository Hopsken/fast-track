import { useRef, useState } from 'react'
import { CommandGroup } from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { CommandMenu } from '../../CommandMenu'
import { useCreateIssueDraftStore } from '../useCreateIssueDraftStore'
import { useFieldConfirm } from '../useFieldConfirm'
import { useWizardNavigation } from '../useWizardNavigation'

interface SummaryDescriptionValue {
  summary: string
  description: string
}

interface Props {
  focusField: 'summary' | 'description'
  onConfirm?: (value: SummaryDescriptionValue) => void
}

export function SummaryDescriptionFieldInput({ focusField, onConfirm }: Props) {
  const { values, setValue } = useCreateIssueDraftStore()
  const { search, setSearch } = useCommandInput()
  const { goToNextField } = useWizardNavigation()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [description, setDescription] = useState<string>(
    typeof values['description'] === 'string'
      ? (values['description'] as string)
      : ''
  )

  // Pre-fill summary into the search box; shift focus if description was clicked
  useMount(() => {
    const currentSummary = values['summary']
    if (typeof currentSummary === 'string') {
      setSearch(currentSummary)
    }
    if (focusField === 'description') {
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  })

  const saveAndContinue = (value: SummaryDescriptionValue) => {
    setValue('summary', value.summary)
    setValue('description', value.description)
    setSearch('')
    goToNextField()
  }

  useFieldConfirm<SummaryDescriptionValue>({
    getValue: () => ({
      summary: search,
      description
    }),
    onConfirm: onConfirm ?? saveAndContinue,
    keys: 'meta+enter'
  })

  return (
    <CommandMenu
      searchPlaceholder="Summary"
      shouldFilter={false}
      searchReadonly={false}>
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
    </CommandMenu>
  )
}
