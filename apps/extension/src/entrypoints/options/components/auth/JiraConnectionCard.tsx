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
    <div className="border-border bg-card rounded-lg border p-6">
      {/* User Info Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-900 to-gray-600">
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
            <h3 className="text-foreground text-lg font-semibold">
              {user.name}
            </h3>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {/* Status Row */}
          <div className="flex items-center gap-2">
            <span
              className="bg-muted text-foreground rounded-full px-3 py-1 text-sm font-medium"
              title={hostname ? `Connected to ${hostname}` : undefined}>
              Connected
            </span>

            <button
              onClick={onDisconnect}
              aria-label="Disconnect"
              className="text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground focus:ring-ring group flex items-center gap-1 rounded-full border border-transparent px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2">
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
