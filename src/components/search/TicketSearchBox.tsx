import { useRef, useEffect } from 'react'
import { HiSearch, HiX } from 'react-icons/hi'

interface TicketSearchBoxProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  onNavigate?: (direction: 'up' | 'down' | 'enter' | 'escape') => void
  placeholder?: string
  autoFocus?: boolean
}

export function TicketSearchBox({ 
  value, 
  onChange, 
  onClear,
  onNavigate,
  placeholder = "Search tickets...", 
  autoFocus = true 
}: TicketSearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        onNavigate?.('down')
        break
      case 'ArrowUp':
        e.preventDefault()
        onNavigate?.('up')
        break
      case 'Enter':
        e.preventDefault()
        onNavigate?.('enter')
        break
      case 'Escape':
        e.preventDefault()
        if (value) {
          onClear()
        } else {
          onNavigate?.('escape')
          inputRef.current?.blur()
        }
        break
    }
  }

  return (
    <div className="relative">
      <div className="relative flex items-center bg-gray-50 rounded-lg border border-gray-200 focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-sm transition-all duration-200 ease-out">
        <HiSearch className="absolute left-3 w-4 h-4 text-gray-400 transition-colors duration-200" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 text-sm font-medium bg-transparent border-0 focus:outline-none placeholder-gray-400 transition-all duration-200"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200 ease-out transform hover:scale-105 active:scale-95"
            title="Clear search"
          >
            <HiX className="w-4 h-4 transition-transform duration-150" />
          </button>
        )}
      </div>
      
      {/* Animated underline for focus state */}
      <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-400 transform -translate-x-1/2 transition-all duration-300 ease-out opacity-0 focus-within:w-full focus-within:opacity-100" />
    </div>
  )
}