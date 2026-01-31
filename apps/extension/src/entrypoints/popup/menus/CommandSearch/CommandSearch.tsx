import { useRef } from '#imports'
import { useLayoutEffect } from 'react'
import { Button } from '@internal/ui/components/button'
import { CommandInput } from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'
import { ArrowLeft } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation, useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useCommandInput } from '@/stores/useCommandInputStore'
import { useIsCommandLoading } from '@/stores/useLoadingStore'

export function CommandSearch() {
  const { search, setSearch } = useCommandInput()

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

  useHotkeys(
    'esc',
    () => {
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
    },
    {
      preventDefault: true,
      enableOnFormTags: true
    }
  )

  // Focus input when active page changes
  useLayoutEffect(() => {
    inputRef?.current?.focus()
    const rafId = window.requestAnimationFrame(() => {
      inputRef.current?.select()
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [pathname])

  return (
    <div className={inputContainerClassName}>
      {previousPageButton}
      <CommandInput
        autoFocus
        ref={inputRef}
        value={search}
        onValueChange={onCommandInputChange}
        placeholder={'Search tickets...'}
        aria-label="Search tickets"
        aria-busy={isCommandLoading}
      />
    </div>
  )
}
