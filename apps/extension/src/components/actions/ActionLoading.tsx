import { useLoadingIndicator } from '@/stores/useLoadingStore'

export function ActionLoading(props: { isLoading: boolean }) {
  useLoadingIndicator(props.isLoading)
  return null
}
