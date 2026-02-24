'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'

const payloadSchema = z.object({
  code: z.string().min(1),
  expiresAt: z.string().min(1),
  extensionId: z.string().min(1)
})

type Payload = z.infer<typeof payloadSchema>

interface Props {
  extensionId: string
}

interface CodeEventData {
  source: 'page'
  payload: Payload
}

interface ConfirmationEventData {
  source: 'content_script'
  success: boolean
  error?: string
}

declare global {
  interface WindowEventMap {
    'ft-extension-link-code': CustomEvent<CodeEventData>
    'ft-extension-link-confirmation': CustomEvent<ConfirmationEventData>
  }
}

export default function ExtensionLinkCommunicator({ extensionId }: Props) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const res = await fetch('/api/extension/link-code', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ extensionId })
        })

        if (!res.ok) {
          throw new Error(`link-code_failed_${res.status}`)
        }

        const json = (await res.json()) as { code: string; expiresAt: string }
        const payload: Payload = payloadSchema.parse({
          code: json.code,
          expiresAt: json.expiresAt,
          extensionId
        })

        const event = new CustomEvent('ft-extension-link-code', {
          detail: { source: 'page', payload }
        })
        window.dispatchEvent(event)
      } catch (e) {
        if (cancelled) return
        setStatus('error')
        setError(e instanceof Error ? e.message : 'unknown_error')
      }
    }

    const onConfirmation = (
      event: CustomEvent<ConfirmationEventData>
    ): void => {
      if (!event.detail || event.detail.source !== 'content_script') return

      if (event.detail.success) {
        setStatus('success')
        setTimeout(() => window.close(), 1500)
      } else {
        setStatus('error')
        setError(event.detail.error ?? 'extension_failed_to_link')
      }
    }

    window.addEventListener('ft-extension-link-confirmation', onConfirmation)

    void run()

    return () => {
      cancelled = true
      window.removeEventListener(
        'ft-extension-link-confirmation',
        onConfirmation
      )
    }
  }, [extensionId])

  if (status === 'loading') {
    return <p className="mt-3 text-sm text-stone-600">Linking extension…</p>
  }

  if (status === 'success') {
    return (
      <p className="mt-3 text-sm text-emerald-700">
        ✓ Linked. You can close this tab.
      </p>
    )
  }

  return <p className="mt-3 text-sm text-red-700">⚠ Linking failed: {error}</p>
}
