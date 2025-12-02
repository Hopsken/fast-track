import { type KeyboardEvent, type RefObject } from 'react'
import { CommandInput } from '@internal/ui/components/command'
import { HiSearch } from 'react-icons/hi'

import { JiraTicket } from '@/types'
import {
  useNavigationActions,
  useIsSearching,
  useSelectedTicket
} from '~/stores/useTicketStore'

interface TicketSearchBoxProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  onTicketClick: (ticket: JiraTicket) => void
  inputRef?: RefObject<HTMLInputElement | null>
  placeholder?: string
}

export function TicketSearchBox({
  value,
  onChange,
  onClear,
  onTicketClick,
  inputRef,
  placeholder = 'Search tickets...'
}: TicketSearchBoxProps) {
  const { navigate } = useNavigationActions()
  const isSearching = useIsSearching()
  const selectedTicket = useSelectedTicket()

  const handleKeyDown = (e: KeyboardEvent) => {
    // Handle copy selected ticket key
    if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
      if (selectedTicket) {
        e.preventDefault()
        navigator.clipboard.writeText(selectedTicket.key)
      }
      return
    }

    // Handle Emacs-style navigation
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault()
      navigate('down', onTicketClick)
      return
    }

    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault()
      navigate('up', onTicketClick)
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        navigate('down', onTicketClick)
        break
      case 'ArrowUp':
        e.preventDefault()
        navigate('up', onTicketClick)
        break
      case 'Enter':
        e.preventDefault()
        navigate('enter', onTicketClick)
        break
      case 'Escape':
        e.preventDefault()
        if (value) {
          onClear()
        } else {
          navigate('escape', onTicketClick)
          inputRef?.current?.blur()
          // Close popup window
          window.close()
        }
        break
    }
  }

  return (
    <div>
      <CommandInput
        ref={inputRef}
        value={value}
        onKeyDown={handleKeyDown}
        onValueChange={(nextValue) => {
          onChange(nextValue)
          if (!nextValue) {
            onClear()
          }
        }}
        placeholder={isSearching ? 'Searching...' : placeholder}
        aria-label="Search tickets"
        aria-busy={isSearching}
      />
      {!value ? (
        <span data-cmdk-linear-badge aria-live="polite">
          <HiSearch aria-hidden="true" /> Start typing to search tickets
        </span>
      ) : null}
    </div>
  )
}
