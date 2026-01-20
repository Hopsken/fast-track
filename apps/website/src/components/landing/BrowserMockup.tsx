'use client'

import { cn } from '@internal/ui/lib/utils'

interface BrowserMockupProps {
  children: React.ReactNode
  className?: string
  url?: string
}

export function BrowserMockup({
  children,
  className,
  url = 'jira.atlassian.net'
}: BrowserMockupProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-2xl shadow-stone-200/50',
        className
      )}>
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/50 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-stone-300/50" />
          <div className="h-3 w-3 rounded-full bg-stone-300/50" />
          <div className="h-3 w-3 rounded-full bg-stone-300/50" />
        </div>
        <div className="flex flex-1 justify-center px-4">
          <div className="flex w-full max-w-sm items-center justify-center gap-2 rounded-md border border-stone-200/50 bg-white py-1 text-[10px] font-medium text-stone-400 shadow-sm">
            <span className="opacity-50">🔒</span> {url}
          </div>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="relative bg-white">{children}</div>
    </div>
  )
}
