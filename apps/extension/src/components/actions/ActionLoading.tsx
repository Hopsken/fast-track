import { useLoadingIndicator } from '@/stores/command/useLoadingStore'

export function ActionLoading(props: { isLoading: boolean }) {
  useLoadingIndicator(props.isLoading)
  return null
}
