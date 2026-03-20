import { useState, useEffect } from 'react'
import { ArrowUpRightFromSquare, Settings } from 'lucide-react'

import { getLogger } from '~/utils/logger'
import {
  getCurrentShortcut,
  openShortcutsPage,
  formatShortcut
} from '~/utils/shortcuts'

const log = getLogger('shortcut-management')

export function ShortcutManagement() {
  const [currentShortcut, setCurrentShortcut] = useState<string>('Alt+J')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadShortcut = async () => {
      try {
        const shortcut = await getCurrentShortcut()
        setCurrentShortcut(shortcut)
      } catch (error) {
        log.warn('Failed to load current shortcut:', error)
      } finally {
        setLoading(false)
      }
    }

    loadShortcut()
  }, [])

  const handleCustomizeClick = () => {
    openShortcutsPage()
  }

  return (
    <div className="border-border rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Settings className="text-muted-foreground h-4 w-4" />
            <h3 className="text-foreground text-sm font-medium">
              Keyboard Shortcut
            </h3>
          </div>

          <p className="text-muted-foreground mb-3 text-sm">
            Quickly open Fast Track from anywhere in your browser
          </p>

          <div className="flex items-center gap-3">
            <div className="text-muted-foreground text-sm">
              Current shortcut:
            </div>
            <div className="border-border bg-background rounded border px-3 py-1.5 font-mono text-sm">
              {loading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                <span className="text-foreground">
                  {formatShortcut(currentShortcut)}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleCustomizeClick}
          className="border-border bg-background hover:border-foreground/30 hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors duration-200"
          title="Open Chrome's shortcuts settings">
          <span>Customize</span>
          <ArrowUpRightFromSquare className="h-3 w-3" />
        </button>
      </div>

      <div className="border-border mt-4 border-t pt-4">
        <p className="text-muted-foreground text-xs">
          {
            'Click "Customize" to change the keyboard shortcut in Chrome\'s extension settings. You can also access this via Chrome menu → More tools → Extensions → Keyboard shortcuts.'
          }
        </p>
      </div>
    </div>
  )
}
