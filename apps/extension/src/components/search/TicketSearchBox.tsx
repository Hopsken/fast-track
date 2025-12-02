import { type KeyboardEvent, type RefObject } from 'react'
import { CommandInput } from '@internal/ui/components/command'
import { HiSearch, HiX } from 'react-icons/hi'

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
    <div className="relative">
      <div className="relative flex items-center rounded-lg border border-gray-200 bg-gray-50 transition-all duration-200 ease-out focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-sm">
        {isSearching ? (
          <svg
            className="absolute left-3 h-4 w-4 animate-spin text-blue-500 transition-colors duration-200"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <HiSearch className="absolute left-3 h-4 w-4 text-gray-400 transition-colors duration-200" />
        )}
        <CommandInput
          ref={inputRef}
          value={value}
          onKeyDown={handleKeyDown}
          placeholder={isSearching ? 'Searching...' : placeholder}
          className="w-full border-0 bg-transparent py-3 pl-10 pr-10 text-sm font-medium placeholder-gray-400 transition-all duration-200 focus:outline-none"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 transform rounded p-1 text-gray-400 transition-all duration-200 ease-out hover:scale-105 hover:bg-gray-100 hover:text-gray-600 active:scale-95"
            title="Clear search">
            <HiX className="h-4 w-4 transition-transform duration-150" />
          </button>
        )}
      </div>

      {/* Animated underline for focus state */}
      <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 transform bg-blue-400 opacity-0 transition-all duration-300 ease-out focus-within:w-full focus-within:opacity-100" />
    </div>
  )
}
