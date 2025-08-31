import type { InputHTMLAttributes, ReactNode } from 'react'

import { FormField, type FormFieldProps } from './FormField'

export type InputFormFieldProps = Omit<FormFieldProps, 'children'> & {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  helperText?: ReactNode
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'placeholder'
  >
}

export function InputFormField(props: InputFormFieldProps) {
  const {
    value,
    onChange,
    placeholder,
    error,
    helperText,
    inputProps,
    ...formFieldProps
  } = props

  const hasError = Boolean(error)

  return (
    <FormField {...formFieldProps}>
      <div className="w-full space-y-2">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input input-lg input-bordered w-full ${
            hasError ? 'input-error' : ''
          }`}
          aria-label={formFieldProps.title}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${formFieldProps.title}-error` : undefined
          }
          {...inputProps}
        />
        {error && (
          <p
            id={`${formFieldProps.title}-error`}
            className="mt-1 text-xs text-red-500"
            role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <div className="text-xs text-gray-500">{helperText}</div>
        )}
      </div>
    </FormField>
  )
}
