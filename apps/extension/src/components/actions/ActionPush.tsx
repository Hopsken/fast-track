import { useCallback } from 'react'

import {
  RouteMap,
  useCommandNavigate,
  useCommandRouter
} from '../CommandRouter'

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

  const onSelect = useCallback(() => {
    const { path, state } = target()
    push(String(path), state)
  }, [target, push])

  return <Action {...restProps} exitOnSelect={false} onSelect={onSelect} />
}
