import type { SelectHTMLAttributes } from 'react'

import { FormField, type FormFieldProps } from './FormField'

export type SelectFormFieldProps = Omit<FormFieldProps, 'children'> & {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  selectProps?: Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    'value' | 'onChange'
  >
}

export function SelectFormField(props: SelectFormFieldProps) {
  const { value, onChange, options, selectProps, ...formFieldProps } = props

  return (
    <FormField {...formFieldProps}>
      <select
        className="select select-bordered select-lg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Select ${formFieldProps.title}`}
        {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}
