import { useMemoizedFn } from 'ahooks'

import { RouteMap, useCommandNavigate } from '../CommandRouter'

import { Action, ActionProps } from './Action'

export interface ActionPushProps<T extends RouteMap>
  extends Omit<ActionProps, 'onSelect'> {
  target: () => { path: keyof T; state: T[keyof T] }
}

export function ActionPush<T extends RouteMap = RouteMap>({
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
