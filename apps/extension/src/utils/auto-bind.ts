export function autoBind<T extends object>(
  instance: T,
  {
    include = [],
    exclude = []
  }: { include?: Array<keyof T>; exclude?: Array<keyof T> } = {
    include: [],
    exclude: []
  }
) {
  const proto = Object.getPrototypeOf(instance)

  for (const key of Object.getOwnPropertyNames(proto)) {
    if (
      exclude.includes(key as keyof T) ||
      key.startsWith('_') ||
      key === 'constructor'
    )
      continue
    if (include.length && !include.includes(key as keyof T)) continue

    const desc = Object.getOwnPropertyDescriptor(proto, key)
    if (!desc) continue

    // Only bind plain methods (value is a function)
    if (typeof desc.value === 'function') {
      instance[key as keyof T] = desc.value.bind(instance)
    }
  }

  return instance
}
