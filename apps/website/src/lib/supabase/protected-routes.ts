export function isProtectedPath(pathname: string): boolean {
  if (!pathname.startsWith('/')) return false

  // protect /account and anything beneath it
  return pathname === '/account' || pathname.startsWith('/account/')
}
