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
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">
              Keyboard Shortcut
            </h3>
          </div>

          <p className="mb-3 text-sm text-gray-600">
            Quickly open Fast Track from anywhere in your browser
          </p>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">Current shortcut:</div>
            <div className="rounded border bg-white px-3 py-1.5 font-mono text-sm">
              {loading ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <span className="text-gray-900">
                  {formatShortcut(currentShortcut)}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleCustomizeClick}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors duration-200 hover:border-gray-400 hover:bg-gray-50"
          title="Open Chrome's shortcuts settings">
          <span>Customize</span>
          <ArrowUpRightFromSquare className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-500">
          {
            'Click "Customize" to change the keyboard shortcut in Chrome\'s extension settings. You can also access this via Chrome menu → More tools → Extensions → Keyboard shortcuts.'
          }
        </p>
      </div>
    </div>
  )
}
