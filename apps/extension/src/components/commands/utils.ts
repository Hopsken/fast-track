/**
 * Command UI helpers for pre-filling and parsing input values
 */

export function prefillStringValue(
  currentValue: unknown,
  setSearch: (value: string) => void
): void {
  if (currentValue && typeof currentValue === 'string') {
    setSearch(currentValue)
  }
}

export function prefillNumberValue(
  currentValue: unknown,
  setSearch: (value: string) => void
): void {
  if (typeof currentValue === 'number') {
    setSearch(String(currentValue))
  }
}

export function prefillArrayValue(
  currentValue: unknown,
  setSearch: (value: string) => void
): void {
  if (Array.isArray(currentValue)) {
    const stringArray = currentValue.filter((item) => typeof item === 'string')
    if (stringArray.length > 0) {
      setSearch(stringArray.join(', '))
    }
  }
}

export function parseCommaSeparated(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
