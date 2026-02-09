import { useRef } from 'react'
import { Button } from '@internal/ui/components/button'
import { CommandInput } from '@internal/ui/components/command'
import { pick } from 'lodash-es'
import { ArrowLeft } from 'lucide-react'
import { useShallow } from 'zustand/shallow'

import { useHotkey } from '@/lib/hotkeys'
import { cn } from '@/lib/utils'

import { useCommandStore } from './context'
import { useIsNavigationRoot, useNavigation } from './navigation'

export function CommandSearch() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { isLoading, searchReadonly, searchPlaceholder, search, setSearch } =
    useCommandStore(
      useShallow((s) =>
        pick(s, [
          'isLoading',
          'searchPlaceholder',
          'searchReadonly',
          'search',
          'setSearch'
        ])
      )
    )

  const isRoot = useIsNavigationRoot()
  const navigate = useNavigation()

  const inputContainerClassName = cn(
    'relative flex h-[52px] items-center gap-3 pl-4 pr-4 border-b-2 border-gray-200',
    isLoading && 'command-input-loading'
  )

  const previousPageButton = !isRoot ? (
    <Button
      variant={'secondary'}
      size={'icon-xs'}
      onClick={() => navigate.pop()}>
      <ArrowLeft />
    </Button>
  ) : null

  useHotkey('global.escape', () => {
    if (searchReadonly) return
    if (search) {
      // clear input value when esc is pressed
      setSearch('')
    } else if (isRoot) {
      // close popup when esc is pressed on root page and input value is empty
      window.close()
    } else {
      // pop to previous page when esc is pressed on other pages and input value is empty
      navigate.pop()
    }
  })

  return (
    <div className={inputContainerClassName}>
      {previousPageButton}
      <CommandInput
        autoFocus
        ref={inputRef}
        value={search}
        onValueChange={setSearch}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        readOnly={searchReadonly}
        aria-busy={isLoading}
      />
    </div>
  )
}
