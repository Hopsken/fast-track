import React, { useMemo } from 'react'
import { Power } from 'lucide-react'

import { JiraUserInfo } from '@/types'

export interface JiraConnectionCardProps {
  user: JiraUserInfo
  jiraHost?: string
  onDisconnect?: () => void
}

export const JiraConnectionCard: React.FC<JiraConnectionCardProps> = ({
  user,
  jiraHost,
  onDisconnect
}) => {
  const hostname = useMemo(() => {
    if (!jiraHost) return ''
    try {
      return new URL(jiraHost).hostname
    } catch {
      return jiraHost
    }
  }, [jiraHost])

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* User Info Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-white">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {/* Status Row */}
          <div className="flex items-center gap-2">
            <div className="group relative">
              <div
                className="rounded-full bg-green-100 px-3 py-1"
                aria-label="Connected">
                <span className="text-sm font-medium text-green-800">
                  Connected
                </span>
              </div>
              {hostname ? (
                <div className="pointer-events-none absolute right-0 top-full mt-1 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                  Connected to {hostname}
                </div>
              ) : null}
            </div>

            <button
              onClick={onDisconnect}
              aria-label="Disconnect"
              className="group flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1.5 text-sm font-medium text-red-700 hover:border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
              <Power className="h-4 w-4" />
              <span className="max-w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100">
                Disconnect
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
