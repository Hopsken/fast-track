import { useMemo, useState } from 'react'
import { Calendar } from '@internal/ui/components/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@internal/ui/components/popover'
import { cn } from '@internal/ui/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, ClockIcon, InfoIcon } from 'lucide-react'

import { SelectComponentProps } from '../../../types'

import { toJiraDate, toJiraDateTime } from './dateParsing'
import { getTemporalLabel, resolveTemporalValue } from './resolvePreset'
import { DATE_PRESETS, DATETIME_PRESETS, isPresetKey } from './temporalPresets'

export type TemporalSelectProps = SelectComponentProps<string> & {
  mode: 'date' | 'datetime'
}

export function TemporalSelect({
  value,
  onChange,
  onConfirm,
  mode
}: TemporalSelectProps) {
  const currentValue = Array.isArray(value) || value == null ? '' : value
  const [calTime, setCalTime] = useState('09:00')
  const [isOpen, setIsOpen] = useState(false)

  const presets = mode === 'date' ? DATE_PRESETS : DATETIME_PRESETS

  const activePreset = isPresetKey(currentValue) ? currentValue : null

  const handlePreset = (key: string) => {
    onChange(key)
    onConfirm?.(key)
    setIsOpen(false)
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return

    let iso: string
    if (mode === 'datetime') {
      const [h, m] = calTime.split(':').map(Number)
      date.setHours(h ?? 9, m ?? 0, 0, 0)
      iso = toJiraDateTime(date)
    } else {
      iso = toJiraDate(date)
    }

    onChange(iso)
    onConfirm?.(iso)
    if (mode === 'date') {
      setIsOpen(false)
    }
  }

  const resolvedHint = useMemo(() => {
    if (!currentValue || !isPresetKey(currentValue)) return null
    const result = resolveTemporalValue(currentValue, mode)
    if (!result.ok) return null
    return mode === 'date'
      ? format(result.date, 'MMM d')
      : format(result.date, "MMM d 'at' h:mm a")
  }, [currentValue, mode])

  const calendarSelected = useMemo(() => {
    if (!currentValue || isPresetKey(currentValue)) return undefined
    const result = resolveTemporalValue(currentValue, mode)
    return result.ok ? result.date : undefined
  }, [currentValue, mode])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-8 w-full max-w-[260px] items-center justify-between rounded-md border px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            !currentValue && 'text-muted-foreground'
          )}>
          <div className="flex items-center gap-2 truncate">
            {mode === 'datetime' ? (
              <ClockIcon className="size-3.5 shrink-0 opacity-50" />
            ) : (
              <CalendarIcon className="size-3.5 shrink-0 opacity-50" />
            )}
            {currentValue ? (
              <span className="text-foreground flex min-w-0 items-center gap-1 font-medium">
                <span className="truncate">
                  {getTemporalLabel(currentValue, mode)}
                </span>
                {resolvedHint && (
                  <span className="text-muted-foreground/70 shrink-0 font-normal">
                    · {resolvedHint}
                  </span>
                )}
              </span>
            ) : (
              <span className="truncate">
                Pick a {mode === 'datetime' ? 'date & time' : 'date'}
              </span>
            )}
          </div>
          {currentValue && (
            <span
              className={cn(
                'ml-2 shrink-0 rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
                isPresetKey(currentValue)
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'bg-muted text-muted-foreground'
              )}>
              {isPresetKey(currentValue) ? 'Dynamic' : 'Fixed'}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto border-0 bg-transparent p-0 shadow-none"
        align="start">
        <div className="bg-card overflow-hidden rounded-md border shadow-lg">
          <div className="flex w-fit flex-row gap-0">
            {/* Presets Sidebar */}
            <div className="bg-muted/30 flex w-[140px] flex-col gap-1 border-r p-2">
              <span className="text-muted-foreground mb-1 px-2 text-[10px] font-semibold uppercase">
                Presets
              </span>
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handlePreset(preset.key)}
                  className={cn(
                    'flex h-7 w-full items-center justify-start rounded-sm px-2 text-xs transition-colors',
                    activePreset === preset.key
                      ? 'bg-primary text-primary-foreground shadow-xs font-medium'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  )}>
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Calendar Area */}
            <div className="bg-card flex flex-col p-2">
              <span className="text-muted-foreground mb-1 px-2 text-[10px] font-semibold uppercase">
                Fixed
              </span>
              <div className="-m-1 flex flex-col">
                <Calendar
                  mode="single"
                  selected={calendarSelected}
                  onSelect={handleCalendarSelect}
                  initialFocus
                />
                {mode === 'datetime' && (
                  <div className="bg-muted/10 mt-1 flex items-center gap-2 border-t px-3 py-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      Time
                    </span>
                    <input
                      type="time"
                      value={calTime}
                      onChange={(e) => {
                        setCalTime(e.target.value)
                        // Auto update the value if a date is already selected
                        if (calendarSelected) {
                          const newDate = new Date(calendarSelected)
                          const [h, m] = e.target.value.split(':').map(Number)
                          newDate.setHours(h ?? 9, m ?? 0, 0, 0)
                          const iso = toJiraDateTime(newDate)
                          onChange(iso)
                          onConfirm?.(iso)
                        }
                      }}
                      className="border-input focus-visible:ring-ring bg-background shadow-xs flex h-7 w-full rounded-md border px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-muted/20 text-muted-foreground flex items-start gap-2 border-t px-3 py-2.5 text-xs">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0 opacity-70" />
            <p className="leading-tight">
              Relative presets resolve dynamically when the issue is created.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
