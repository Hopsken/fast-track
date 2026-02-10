import { useCallback, useRef, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import { CommandInput } from '@internal/ui/components/command'
import { ArrowLeft } from 'lucide-react'

import { useHotkey } from '@/lib/hotkeys'
import { cn } from '@/lib/utils'

import { useIsNavigationRoot, useNavigation } from './navigation'

export type ActionSearchProps = {
  defaultSearch?: string
  search?: string
  onSearchChange?: (search: string) => void

  isLoading?: boolean
  readonly?: boolean
  placeholder?: string

  onNavigateBack?: () => void
}

export function ActionSearch({
  defaultSearch,
  search,
  onSearchChange,
  isLoading,
  readonly,
  placeholder,
  onNavigateBack
}: ActionSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const isControlled = search !== undefined
  const [uncontrolledSearch, setUncontrolledSearch] = useState(
    defaultSearch ?? ''
  )

  const currentValue = isControlled ? search : uncontrolledSearch

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
    'relative flex h-[52px] items-center gap-3 pl-4 pr-4 border-b-2 border-gray-200',
    isLoading && 'command-input-loading'
  )

  const handleNavigateBack = () => {
    if (onNavigateBack) {
      onNavigateBack()
    } else {
      navigate.pop()
    }
  }

  const previousPageButton = !isRoot ? (
    <Button variant={'secondary'} size={'icon-xs'} onClick={handleNavigateBack}>
      <ArrowLeft />
    </Button>
  ) : null

  useHotkey('global.escape', () => {
    if (currentValue && !readonly) {
      // clear input value when esc is pressed
      onValueChange('')
    } else if (isRoot) {
      // close popup when esc is pressed on root page and input value is empty
      window.close()
    } else {
      // pop to previous page when esc is pressed on other pages and input value is empty
      handleNavigateBack()
    }
  })

  return (
    <div className={inputContainerClassName}>
      {previousPageButton}
      <CommandInput
        autoFocus
        ref={inputRef}
        value={currentValue}
        onValueChange={onValueChange}
        placeholder={placeholder ?? 'Type to search...'}
        aria-label={placeholder}
        readOnly={readonly}
        aria-busy={isLoading}
      />
    </div>
  )
}
