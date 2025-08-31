import React, { type PropsWithChildren, type ReactNode } from 'react'

export type FieldControlProps = {
  size?: 'sm' | 'lg'
  title: string
  description: string | ReactNode
  onClick?: () => void
}

export function FieldControl(props: PropsWithChildren<FieldControlProps>) {
  const { size = 'sm' } = props

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (props.onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      props.onClick()
    }
  }

  return (
    <div
      className={`field flex items-center ${
        props.onClick ? 'cursor-pointer' : ''
      }`}
      onClick={props.onClick}
      onKeyDown={handleKeyPress}
      tabIndex={props.onClick ? 0 : undefined}
      role={props.onClick ? 'button' : undefined}
      aria-label={
        props.onClick ? `${props.title}. ${props.description}` : undefined
      }>
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
