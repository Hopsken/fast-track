import type { PropsWithChildren } from 'react'

export type FieldControlProps = {
  size?: 'sm' | 'lg'
  title: string
  description: string | React.ReactNode
  onClick?: () => void
}

export function FieldControl(props: PropsWithChildren<FieldControlProps>) {
  const { size = 'sm' } = props
  return (
    <div
      className={`field flex items-center ${
        props.onClick ? 'cursor-pointer' : ''
      }`}
      onClick={props.onClick}>
      <div className="flex flex-1 flex-col space-y-1">
        <div className={size === 'sm' ? 'text-sm' : 'text-lg'}>
          {props.title}
        </div>
        <div className={`${size === 'sm' ? 'text-xs' : 'text-base'} `}>
          {props.description}
        </div>
      </div>
      <div className="flex flex-none items-center justify-center">
        {props.children}
      </div>
    </div>
  )
}
