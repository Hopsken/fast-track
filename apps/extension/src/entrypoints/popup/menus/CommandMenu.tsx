import { useRef } from '#imports'
import { useLayoutEffect } from 'react'
import { Button } from '@internal/ui/components/button'
import { Command, CommandInput } from '@internal/ui/components/command'
import { useMemoizedFn } from 'ahooks'
import { ArrowLeft } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Outlet } from 'react-router-dom'

import { useCommandRouter } from '@/components/CommandRouter'
import { cn } from '@/lib/utils'
import { useIsCommandLoading } from '@/stores/useLoadingStore'

import { Footer } from './Footer'

const COMMAND_CHARS = ['/', '+']

export function CommandMenu() {
  const {
    activePage,
    activeSearch,
    activeValue,
    history,
    setSearch,
    setValue,
    pop
  } = useCommandRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const isCommandLoading = useIsCommandLoading()

  const isSearchResultPage =
    activePage.path === '/' &&
    !COMMAND_CHARS.some((char) => activeSearch.startsWith(char))
  const inputContainerClassName = cn(
    'relative flex h-[52px] items-center gap-3 pl-4 pr-4 border-b-2 border-gray-200',
    isCommandLoading && 'command-input-loading'
  )

  const onCommandInputChange = useMemoizedFn((value: string) => {
    setSearch(value)
  })

  const previousPageButton =
    history.length > 1 ? (
      <Button variant={'secondary'} size={'icon-xs'} onClick={() => pop()}>
        <ArrowLeft />
      </Button>
    ) : null

  useHotkeys(
    'esc',
    () => {
      if (activeSearch) {
        // clear input value when esc is pressed
        onCommandInputChange('')
      } else if (history.length === 1) {
        // close popup when esc is pressed on root page and input value is empty
        window.close()
      } else {
        // pop to previous page when esc is pressed on other pages and input value is empty
        pop()
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
  }, [activePage.path])

  return (
    <Command
      loop
      shouldFilter={!isSearchResultPage}
      value={activeValue}
      onValueChange={setValue}>
      <div className={inputContainerClassName}>
        {previousPageButton}
        <CommandInput
          autoFocus
          ref={inputRef}
          value={activeSearch}
          onValueChange={onCommandInputChange}
          placeholder={'Search tickets...'}
          aria-label="Search tickets"
          aria-busy={isCommandLoading}
        />
      </div>

      <Outlet />

      <Footer />
    </Command>
  )
}
