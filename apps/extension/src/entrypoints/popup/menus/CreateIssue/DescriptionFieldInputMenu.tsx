import { useEffect, useState } from 'react'
import { CommandGroup, CommandList } from '@internal/ui/components/command'
import { useHotkeys } from 'react-hotkeys-hook'

import { useCommandRouter } from '@/components/CommandRouter'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'

export function DescriptionFieldInputMenu() {
  const { values, setValue } = useCreateIssueDraftStore()
  const currentValue = values['description']

  const [text, setText] = useState<string>(
    typeof currentValue === 'string' ? currentValue : ''
  )

  useEffect(() => {
    setText(typeof currentValue === 'string' ? currentValue : '')
  }, [currentValue])

  const { pop, setSearch } = useCommandRouter()

  useHotkeys(
    'meta+enter',
    () => {
      setValue('description', text)
      setSearch('')
      pop()
    },
    { preventDefault: true, enableOnFormTags: true },
    [pop, setSearch, setValue, text]
  )

  return (
    <CommandList>
      <CommandGroup heading="Description">
        <div className="p-3">
          <textarea
            className="border-input bg-background focus-visible:ring-ring/50 min-h-[140px] w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type description… (⌘ Enter to save)"
          />
        </div>
      </CommandGroup>
    </CommandList>
  )
}
