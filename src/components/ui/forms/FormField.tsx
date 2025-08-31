import { cva, type VariantProps } from 'class-variance-authority'
import type { PropsWithChildren, ReactNode, KeyboardEvent } from 'react'

import { cn } from '~/lib/utils'

import { FormItem, FormLabel, FormControl, FormDescription } from '../form'

const formFieldVariants = cva(
  'flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors',
  {
    variants: {
      size: {
        sm: 'gap-2 p-2',
        lg: 'gap-4 p-4'
      },
      variant: {
        default: 'border-gray-200 dark:border-gray-700',
        clickable:
          'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
      }
    },
    defaultVariants: {
      size: 'sm',
      variant: 'default'
    }
  }
)

export type FormFieldProps = {
  size?: 'sm' | 'lg'
  title: string
  description: string | ReactNode
  onClick?: () => void
  className?: string
} & VariantProps<typeof formFieldVariants>

export function FormField(props: PropsWithChildren<FormFieldProps>) {
  const {
    size = 'sm',
    title,
    description,
    onClick,
    className,
    children
  } = props

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick()
    }
  }

  const variant = onClick ? 'clickable' : 'default'

  return (
    <FormItem>
      <div
        className={cn(formFieldVariants({ size, variant }), className)}
        onClick={onClick}
        onKeyDown={handleKeyPress}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : undefined}
        aria-label={
          onClick
            ? `${title}. ${typeof description === 'string' ? description : 'Interactive field'}`
            : undefined
        }>
        <div className="flex flex-1 flex-col space-y-1">
          <FormLabel className={size === 'sm' ? 'text-sm' : 'text-lg'}>
            {title}
          </FormLabel>
          <FormDescription className={size === 'sm' ? 'text-xs' : 'text-base'}>
            {description}
          </FormDescription>
        </div>
        <div className="flex flex-none items-center justify-center">
          <FormControl>{children}</FormControl>
        </div>
      </div>
    </FormItem>
  )
}
