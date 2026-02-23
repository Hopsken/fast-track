export type CookieLike = {
  name: string
}

export function hasSupabaseAuthCookies(cookies: CookieLike[]): boolean {
  return cookies.some((cookie) => cookie.name.startsWith('sb-'))
}
