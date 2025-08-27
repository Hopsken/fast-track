import { useRef, useEffect } from 'react'
import { HiSearch, HiX } from 'react-icons/hi'

interface TicketSearchBoxProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  autoFocus?: boolean
}

export function TicketSearchBox({ 
  value, 
  onChange, 
  onClear, 
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
    if (e.key === 'Escape') {
      if (value) {
        onClear()
      } else {
        inputRef.current?.blur()
      }
    }
  }

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <HiSearch className="absolute left-2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-8 py-2 text-md border-0 focus:outline-none"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}