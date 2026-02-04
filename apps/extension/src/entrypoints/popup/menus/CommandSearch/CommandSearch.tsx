import { useRef } from '#imports'
import { useLayoutEffect } from 'react'
import { Button } from '@internal/ui/components/button'
import { CommandInput } from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'
import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useHotkey } from '@/lib/hotkeys'
import { cn } from '@/lib/utils'
import { useCommandSearchState } from '@/stores/command/useCommandController'
import { useCommandInput } from '@/stores/command/useCommandInputStore'
import { useIsCommandLoading } from '@/stores/command/useLoadingStore'

export function CommandSearch() {
  const { search, setSearch } = useCommandInput()
  const { searchPlaceholder, searchReadonly } = useCommandSearchState()

  const inputRef = useRef<HTMLInputElement>(null)
  const isCommandLoading = useIsCommandLoading()

  const { pathname } = useLocation()

  const navigate = useNavigate()
  const isRoot = pathname === '/'

  const inputContainerClassName = cn(
    'relative flex h-[52px] items-center gap-3 pl-4 pr-4 border-b-2 border-gray-200',
    isCommandLoading && 'command-input-loading'
  )

  const onCommandInputChange = useMemoizedFn((value: string) => {
    setSearch(value)
  })

  const previousPageButton = !isRoot ? (
    <Button variant={'secondary'} size={'icon-xs'} onClick={() => navigate(-1)}>
      <ArrowLeft />
    </Button>
  ) : null

  useHotkey('global.escape', () => {
    if (search) {
      // clear input value when esc is pressed
      onCommandInputChange('')
    } else if (isRoot) {
      // close popup when esc is pressed on root page and input value is empty
      window.close()
    } else {
      // pop to previous page when esc is pressed on other pages and input value is empty
      navigate(-1)
    }
  })

  // Focus input when active page changes
  useLayoutEffect(() => {
    if (searchReadonly) return
    inputRef?.current?.focus()
    const rafId = window.requestAnimationFrame(() => {
      inputRef.current?.select()
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div className={inputContainerClassName}>
      {previousPageButton}
      <CommandInput
        autoFocus
        ref={inputRef}
        value={search}
        onValueChange={onCommandInputChange}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        readOnly={searchReadonly}
        aria-busy={isCommandLoading}
      />
    </div>
  )
}
