import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import { CommandInput } from '@internal/ui/components/command'
import { ArrowLeft } from 'lucide-react'

import { useHotkey } from '@/lib/hotkeys'
import { cn } from '@/lib/utils'

import { resolveEscapeAction } from './actionSearchEscape'
import {
  useIsNavigationRoot,
  useNavigateBack,
  useNavigation
} from './navigation'

export type ActionSearchProps = {
  defaultSearch?: string
  search?: string
  onSearchChange?: (search: string) => void
  onSearchConfirm?: () => void

  isLoading?: boolean
  readonly?: boolean
  placeholder?: string

  /**
   * If true, and the initial value is non-empty, the whole input will be
   * selected on mount. Useful when returning to a previous menu.
   */
  autoSelectOnMount?: boolean
}

export function ActionSearch({
  defaultSearch,
  search,
  onSearchChange,
  onSearchConfirm,
  isLoading,
  readonly,
  placeholder,
  autoSelectOnMount
}: ActionSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const onNavigateBack = useNavigateBack()

  const isControlled = search !== undefined
  const [uncontrolledSearch, setUncontrolledSearch] = useState(
    defaultSearch ?? ''
  )

  const currentValue = isControlled ? search : uncontrolledSearch
  const initialValueRef = useRef(currentValue)

  const onValueChange = useCallback(
    (value: string) => {
      if (!isControlled) {
        setUncontrolledSearch(value)
      }
      onSearchChange?.(value)
    },
    [isControlled, onSearchChange]
  )

  const isRoot = useIsNavigationRoot()
  const navigate = useNavigation()

  const inputContainerClassName = cn(
    'relative flex h-[52px] items-center gap-3 pl-4 pr-4 border-b border-gray-200',
    isLoading && 'command-input-loading'
  )

  const handleNavigateBack = () => {
    if (onNavigateBack) {
      onNavigateBack()
    } else {
      navigate.pop()
    }
  }

  const onKeydown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && onSearchConfirm) {
        onSearchConfirm()
      }
    },
    [onSearchConfirm]
  )

  const previousPageButton = !isRoot ? (
    <Button variant={'secondary'} size={'icon-xs'} onClick={handleNavigateBack}>
      <ArrowLeft />
    </Button>
  ) : null

  const clearCurrentSearch = useCallback(() => {
    if (readonly) return

    if (isControlled) {
      onSearchChange?.('')
    } else {
      setUncontrolledSearch('')
    }
  }, [isControlled, onSearchChange, readonly])

  useEffect(() => {
    if (!autoSelectOnMount) return
    if (readonly) return

    // Only auto-select when the input initially mounts with a non-empty value.
    // This avoids selecting while the user is typing from an empty state.
    if (!initialValueRef.current) return

    const selectAll = () => {
      const el = inputRef.current
      if (!el) return

      el.focus()
      el.setSelectionRange(0, el.value.length)
    }

    const timerId = window.setTimeout(selectAll, 0)
    return () => window.clearTimeout(timerId)
  }, [autoSelectOnMount, readonly])

  useHotkey('global.escape', () => {
    const action = resolveEscapeAction({
      hasSearchValue: !!currentValue,
      isRoot,
      readonly
    })

    if (action === 'clear-search') {
      // clear input value when esc is pressed
      onValueChange('')
      return
    }

    clearCurrentSearch()

    if (action === 'close-popup') {
      // close popup when esc is pressed on root page and input value is empty
      window.close()
      return
    }

    // pop to previous page when esc is pressed on other pages and input value is empty
    handleNavigateBack()
  })

  return (
    <div className={inputContainerClassName}>
      {previousPageButton}
      <CommandInput
        autoFocus
        ref={inputRef}
        value={currentValue}
        onValueChange={onValueChange}
        onKeyDown={onKeydown}
        placeholder={placeholder ?? 'Type to search...'}
        aria-label={placeholder}
        readOnly={readonly}
        aria-busy={isLoading}
      />
    </div>
  )
}
