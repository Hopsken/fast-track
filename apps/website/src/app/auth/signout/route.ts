import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseRouteHandlerClient } from '../../../lib/supabase/server'

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const supabase = await createSupabaseRouteHandlerClient()

  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/', url.origin), { status: 303 })
}
