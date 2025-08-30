import { useMount, useWhyDidYouUpdate } from 'ahooks'
import { useRef, KeyboardEvent } from 'react'
import { HiSearch, HiX } from 'react-icons/hi'

import { type JiraTicket } from '@/storage'
import { useNavigationActions } from '~/stores/useTicketStore'

interface TicketSearchBoxProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  onTicketClick: (ticket: JiraTicket) => void
  placeholder?: string
  autoFocus?: boolean
}

export function TicketSearchBox({
  value,
  onChange,
  onClear,
  onTicketClick,
  placeholder = 'Search tickets...',
  autoFocus = true
}: TicketSearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { navigate } = useNavigationActions()

  useWhyDidYouUpdate('TickerSearchBox', {
    value,
    onChange,
    onClear,
    onTicketClick,
    placeholder,
    autoFocus
  })

  useMount(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  })

  const handleKeyDown = (e: KeyboardEvent) => {
    console.log('🔍 TicketSearchBox - Key pressed:', {
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      target: e.target,
      currentTarget: e.currentTarget
    })

    switch (e.key) {
      case 'ArrowDown':
        console.log(
          '🔍 TicketSearchBox - Arrow Down pressed, preventing default and navigating'
        )
        e.preventDefault()
        navigate('down', onTicketClick)
        break
      case 'ArrowUp':
        console.log(
          '🔍 TicketSearchBox - Arrow Up pressed, preventing default and navigating'
        )
        e.preventDefault()
        navigate('up', onTicketClick)
        break
      case 'Enter':
        console.log(
          '🔍 TicketSearchBox - Enter pressed, preventing default and navigating'
        )
        e.preventDefault()
        navigate('enter', onTicketClick)
        break
      case 'Escape':
        console.log('🔍 TicketSearchBox - Escape pressed, preventing default')
        e.preventDefault()
        if (value) {
          console.log('🔍 TicketSearchBox - Clearing search value')
          onClear()
        } else {
          console.log(
            '🔍 TicketSearchBox - Navigating escape and blurring input'
          )
          navigate('escape', onTicketClick)
          inputRef.current?.blur()
        }
        break
      default:
        console.log('🔍 TicketSearchBox - Unhandled key:', e.key)
    }
  }

  return (
    <div className="relative">
      <div className="relative flex items-center rounded-lg border border-gray-200 bg-gray-50 transition-all duration-200 ease-out focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-sm">
        <HiSearch className="absolute left-3 h-4 w-4 text-gray-400 transition-colors duration-200" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent py-3 pr-10 pl-10 text-sm font-medium placeholder-gray-400 transition-all duration-200 focus:outline-none"
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
