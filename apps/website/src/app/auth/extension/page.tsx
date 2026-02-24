import { redirect } from 'next/navigation'

import { createSupabaseServerClientReadOnly } from '../../../lib/supabase/server'

import ExtensionLinkCommunicator from './ExtensionLinkCommunicator'

export const dynamic = 'force-dynamic'

export default async function ExtensionAuthPage({
  searchParams
}: {
  searchParams: Promise<{ extension_id?: string }>
}) {
  const { extension_id: extensionId } = await searchParams

  if (!extensionId) {
    return (
      <main className="min-h-dvh bg-[#FDFBF9]">
        <div className="container mx-auto flex min-h-dvh flex-col items-center justify-center px-6">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6">
            <h1 className="font-serif text-xl font-semibold text-stone-900">
              Missing extension id
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Please restart linking from the extension.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const supabase = await createSupabaseServerClientReadOnly()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    const next = `/auth/extension?extension_id=${encodeURIComponent(extensionId)}`
    redirect(`/login?next=${encodeURIComponent(next)}`)
  }

  return (
    <main className="min-h-dvh bg-[#FDFBF9]">
      <div className="container mx-auto flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)]">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-stone-900">
            Link extension
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Sending a one-time code to the extension…
          </p>

          <ExtensionLinkCommunicator extensionId={extensionId} />
        </div>
      </div>
    </main>
  )
}
