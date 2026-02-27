export type EscapeAction = 'clear-search' | 'close-popup' | 'navigate-back'

export function resolveEscapeAction({
  hasSearchValue,
  isRoot,
  readonly
}: {
  hasSearchValue: boolean
  isRoot: boolean
  readonly?: boolean
}): EscapeAction {
  if (hasSearchValue && !readonly) {
    return 'clear-search'
  }

  return isRoot ? 'close-popup' : 'navigate-back'
}
