import React from 'react'
import {
  HiCog6Tooth as Settings
  // HiArrowTopRightOnSquare as ExternalLink
} from 'react-icons/hi2'

import { OAuthUserInfo } from '@/lib/storage'

export interface JiraConnectionCardProps {
  user: OAuthUserInfo
  onSettings?: () => void
  onDisconnect?: () => void
}

export const JiraConnectionCard: React.FC<JiraConnectionCardProps> = ({
  user,
  onSettings,
  onDisconnect
}) => {
  // const displayAccountId =
  //   user.accountId.length > 10
  //     ? `${user.accountId.substring(0, 8)}...`
  //     : user.accountId

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* User Info Section */}
      <div className="mb-6 flex items-start justify-between">
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Connected Badge */}
        <div className="rounded-full bg-green-100 px-3 py-1">
          <span className="text-sm font-medium text-green-800">Connected</span>
        </div>
      </div>

      {/* Workspace Info */}
      {/* <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Jira Instance
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {workspace.name}
            </span>
            {workspace.url && (
              <button
                onClick={() =>
                  workspace.url && window.open(workspace.url, '_blank')
                }
                className="text-gray-400 hover:text-gray-600"
                title="Open workspace">
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Account ID</span>
          <span className="text-sm text-gray-900">{displayAccountId}</span>
        </div>
      </div> */}

      {/* Action Buttons */}
      <div className="mb-4 flex gap-3">
        <button
          onClick={onSettings}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
          <Settings className="h-4 w-4" />
          Settings
        </button>

        <button
          onClick={onDisconnect}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Disconnect
        </button>
      </div>

      {/* Footer Message */}
      <p className="text-center text-sm text-gray-500">
        Extension is ready to enhance your Jira experience
      </p>
    </div>
  )
}