import { useMemoizedFn } from 'ahooks'

import { useCommandNavigate } from '../CommandRouter'

import { Action, ActionProps } from './Action'

export interface ActionPushProps<T extends keyof RouteMap>
  extends Omit<ActionProps, 'onSelect'> {
  target: () => { path: T; state: RouteMap[T] }
}

export function ActionPush<T extends keyof RouteMap>({
  target,
  ...restProps
}: ActionPushProps<T>) {
  const { push } = useCommandNavigate()

  const onSelect = useMemoizedFn(() => {
    const { path, state } = target()
    push(String(path), state)
  })

  return <Action {...restProps} exitOnSelect={false} onSelect={onSelect} />
}
