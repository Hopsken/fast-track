import { useRef, useState } from 'react'
import { CommandGroup } from '@internal/ui/components/command'
import { useMount } from 'ahooks'
import { useHotkeys } from 'react-hotkeys-hook'

import { useCommandInput } from '@/stores/useCommandInputStore'

import { CommandMenu } from '../../CommandMenu'
import { useCreateIssueDraftStore } from '../useCreateIssueDraftStore'
import { useWizardNavigation } from '../useWizardNavigation'

interface Props {
  focusField: 'summary' | 'description'
}

export function SummaryDescriptionFieldInputMenu({ focusField }: Props) {
  const { values, setValue } = useCreateIssueDraftStore()
  const { search, setSearch } = useCommandInput()
  const { goToNextField, currentStep, totalSteps } = useWizardNavigation()
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

  const saveAndContinue = () => {
    setValue('summary', search)
    setValue('description', description)
    setSearch('')
    goToNextField()
  }

  useHotkeys(
    'meta+enter',
    saveAndContinue,
    { preventDefault: true, enableOnFormTags: true },
    [search, description]
  )

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
          <p className="text-muted-foreground mt-2 text-center text-[10px]">
            ⌘ Enter to continue ({currentStep}/{totalSteps})
          </p>
        </div>
      </CommandGroup>
    </CommandMenu>
  )
}
