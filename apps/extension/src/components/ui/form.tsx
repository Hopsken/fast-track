import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '~/lib/utils'

import { Label } from './label'

const formItemVariants = cva('space-y-2')

const formLabelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
)

const formDescriptionVariants = cva('text-sm text-gray-600 dark:text-gray-400')

const formMessageVariants = cva(
  'text-sm font-medium text-red-500 dark:text-red-400'
)

interface FormItemContextValue {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof formItemVariants>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn(formItemVariants(), className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = 'FormItem'

const useFormItem = () => {
  const itemContext = React.useContext(FormItemContext)

  if (!itemContext) {
    throw new Error('useFormItem should be used within <FormItem>')
  }

  const { id } = itemContext

  return {
    id,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`
  }
}

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label> &
    VariantProps<typeof formLabelVariants>
>(({ className, ...props }, ref) => {
  const { formItemId } = useFormItem()

  return (
    <Label
      ref={ref}
      className={cn(formLabelVariants(), className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { formItemId, formDescriptionId, formMessageId } = useFormItem()

  return (
    <div
      ref={ref}
      id={formItemId}
      aria-describedby={`${formDescriptionId} ${formMessageId}`}
      {...props}
    />
  )
})
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> &
    VariantProps<typeof formDescriptionVariants>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormItem()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(formDescriptionVariants(), className)}
      {...props}
    />
  )
})
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> &
    VariantProps<typeof formMessageVariants>
>(({ className, children, ...props }, ref) => {
  const { formMessageId } = useFormItem()

  if (!children) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(formMessageVariants(), className)}
      {...props}>
      {children}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

export {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormItem
}
