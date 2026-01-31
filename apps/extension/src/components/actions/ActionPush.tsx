import { useMemoizedFn } from 'ahooks'
import { useNavigate } from 'react-router-dom'

import { Action, ActionProps } from './Action'

export interface ActionPushProps extends Omit<ActionProps, 'onSelect'> {
  target: string
}

export function ActionPush({ target, ...restProps }: ActionPushProps) {
  const navigate = useNavigate()
  const onSelect = useMemoizedFn(() => {
    navigate(target)
  })

  return <Action {...restProps} exitOnSelect={false} onSelect={onSelect} />
}
