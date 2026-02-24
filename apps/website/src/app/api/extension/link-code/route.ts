import { NextRequest, NextResponse } from 'next/server'

import {
  computeLinkCodeExpiry,
  generateLinkCode,
  hashLinkCode
} from '../../../../lib/extension-auth/link-code'
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin'
import { createSupabaseRouteHandlerClient } from '../../../../lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RequestBody = {
  extensionId?: string
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseRouteHandlerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
  }

  let body: RequestBody = {}
  try {
    body = (await request.json()) as RequestBody
  } catch {
    body = {}
  }

  const extensionId =
    typeof body.extensionId === 'string' && body.extensionId.trim().length > 0
      ? body.extensionId.trim()
      : null

  if (!extensionId) {
    return NextResponse.json({ error: 'missing_extension_id' }, { status: 400 })
  }

  const code = generateLinkCode()
  const codeHash = hashLinkCode(code)
  const expiresAt = computeLinkCodeExpiry()

  const admin = createSupabaseAdminClient()

  const { error } = await admin.from('extension_link_codes').insert({
    code_hash: codeHash,
    user_id: user.id,
    extension_id: extensionId,
    expires_at: expiresAt.toISOString(),
    consumed_at: null
  })

  if (error) {
    return NextResponse.json(
      { error: 'failed_to_create_code' },
      { status: 500 }
    )
  }

  const response = NextResponse.json(
    { code, expiresAt: expiresAt.toISOString() },
    { status: 200 }
  )
  response.headers.set('Cache-Control', 'no-store')
  return response
}
