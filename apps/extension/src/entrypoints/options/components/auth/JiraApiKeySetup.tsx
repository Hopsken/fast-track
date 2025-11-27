import React, { useEffect, useState } from 'react'

export interface JiraApiKeySetupProps {
  onConnect: (payload: { host: string; email: string; apiKey: string }) => void
  isLoading?: boolean
  defaultValues?: Partial<{ host: string; email: string; apiKey: string }>
  error?: string | null
}

export const JiraApiKeySetup: React.FC<JiraApiKeySetupProps> = ({
  onConnect,
  isLoading = false,
  defaultValues,
  error
}) => {
  const [host, setHost] = useState(defaultValues?.host ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')
  const [apiKey, setApiKey] = useState(defaultValues?.apiKey ?? '')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    setHost(defaultValues?.host ?? '')
    setEmail(defaultValues?.email ?? '')
    setApiKey(defaultValues?.apiKey ?? '')
  }, [defaultValues])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onConnect({
      host: host.trim(),
      email: email.trim(),
      apiKey: apiKey.trim()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Connect with API key
        </h2>
        <p className="text-sm text-gray-600">
          Use your Atlassian API token when OAuth is not available.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Jira site URL
          <input
            type="text"
            name="host"
            autoComplete="url"
            value={host}
            onChange={(event) => setHost(event.target.value)}
            placeholder="https://your-domain.atlassian.net"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            required
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Jira account email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            required
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          API token
          <div className="mt-1 flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              name="apiKey"
              autoComplete="off"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Paste your Atlassian API token"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              required
            />
            <button
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              className="min-w-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900">
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Generate a token from your Atlassian account: Profile &gt; Security
            &gt; Create and manage API tokens.
          </p>
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          {isLoading ? 'Connecting...' : 'Save API key'}
        </button>
      </div>
    </form>
  )
}
