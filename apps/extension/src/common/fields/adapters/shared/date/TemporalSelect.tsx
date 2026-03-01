import { useMemo, useState } from 'react'
import { Calendar } from '@internal/ui/components/calendar'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@internal/ui/components/tabs'
import { cn } from '@internal/ui/lib/utils'
import { motion } from 'motion/react'

import { SelectComponentProps } from '../../../types'

import { toJiraDate, toJiraDateTime } from './dateParsing'
import { getTemporalLabel, resolveTemporalValue } from './resolvePreset'
import { DATE_PRESETS, DATETIME_PRESETS, isPresetKey } from './temporalPresets'

type Tab = 'presets' | 'calendar'

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
  const [tab, setTab] = useState<Tab>('presets')
  const [calTime, setCalTime] = useState('09:00')

  const presets = mode === 'date' ? DATE_PRESETS : DATETIME_PRESETS

  const preview = useMemo(() => {
    if (!currentValue) return null
    const result = resolveTemporalValue(currentValue, mode)
    return result.ok ? result.iso : null
  }, [currentValue, mode])

  const activePreset = isPresetKey(currentValue) ? currentValue : null

  const handlePreset = (key: string) => {
    onChange(key)
    onConfirm?.(key)
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
  }

  const calendarSelected = useMemo(() => {
    if (!currentValue || isPresetKey(currentValue)) return undefined
    const result = resolveTemporalValue(currentValue, mode)
    return result.ok ? result.date : undefined
  }, [currentValue, mode])

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
      <TabsList className="h-7">
        <TabsTrigger
          value="presets"
          className="h-[calc(100%-2px)] px-2.5 text-xs">
          Presets
        </TabsTrigger>
        <TabsTrigger
          value="calendar"
          className="h-[calc(100%-2px)] px-2.5 text-xs">
          Calendar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="presets">
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.14, ease: [0.0, 0.0, 0.2, 1] }}
          className="grid grid-cols-3 gap-1">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => handlePreset(preset.key)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-left text-xs transition active:scale-[0.97]',
                activePreset === preset.key
                  ? 'border-primary/40 bg-primary/[0.08] text-primary font-medium'
                  : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
              )}>
              {preset.label}
            </button>
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="calendar">
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.14, ease: [0.0, 0.0, 0.2, 1] }}
          className="flex flex-col gap-2">
          <Calendar
            mode="single"
            selected={calendarSelected}
            onSelect={handleCalendarSelect}
            initialFocus
          />
          {mode === 'datetime' && (
            <div className="flex items-center gap-2 px-3 pb-1">
              <span className="text-muted-foreground text-xs">Time</span>
              <input
                type="time"
                value={calTime}
                onChange={(e) => setCalTime(e.target.value)}
                className="border-input bg-background h-7 rounded-md border px-2 text-xs"
              />
            </div>
          )}
        </motion.div>
      </TabsContent>

      {currentValue && (
        <motion.div
          key={currentValue}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.14 }}
          className="text-muted-foreground flex items-center gap-1 text-xs">
          <span>{getTemporalLabel(currentValue, mode)}</span>
          {isPresetKey(currentValue) && preview && (
            <span className="font-mono tabular-nums opacity-60">
              → {preview}
            </span>
          )}
        </motion.div>
      )}
    </Tabs>
  )
}
