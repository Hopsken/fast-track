export function nextTick(fn: () => unknown) {
  return Promise.resolve().then(() => fn())
}
