const pendingIds = new Set<number>()

export function addReconcileId(id: number): void {
  pendingIds.add(id)
}

export function getReconcileIds(): number[] {
  return Array.from(pendingIds)
}

export function clearReconcileIds(): void {
  pendingIds.clear()
}
