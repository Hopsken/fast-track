import { useState, useEffect } from 'react'
import { HiOutlineCog6Tooth, HiArrowTopRightOnSquare } from 'react-icons/hi2'
import { getCurrentShortcut, openShortcutsPage, formatShortcut } from '~/utils/shortcuts'

export function ShortcutManagement() {
  const [currentShortcut, setCurrentShortcut] = useState<string>('Alt+J')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadShortcut = async () => {
      try {
        const shortcut = await getCurrentShortcut()
        setCurrentShortcut(shortcut)
      } catch (error) {
        console.warn('Failed to load current shortcut:', error)
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
    <div className="bg-gray-50 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineCog6Tooth className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Keyboard Shortcut</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Quickly open Jira Boost from anywhere in your browser
          </p>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">Current shortcut:</div>
            <div className="font-mono text-sm bg-white px-3 py-1.5 rounded border">
              {loading ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <span className="text-gray-900">{formatShortcut(currentShortcut)}</span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleCustomizeClick}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
          title="Open Chrome's shortcuts settings"
        >
          <span>Customize</span>
          <HiArrowTopRightOnSquare className="w-3 h-3" />
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Click "Customize" to change the keyboard shortcut in Chrome's extension settings. 
          You can also access this via Chrome menu → More tools → Extensions → Keyboard shortcuts.
        </p>
      </div>
    </div>
  )
}