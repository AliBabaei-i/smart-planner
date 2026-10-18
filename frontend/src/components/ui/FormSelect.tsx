import React, { useCallback, memo } from 'react'
import CustomSelect from './CustomSelect'

interface SelectOption {
  value: string | number
  label: string
}

interface FormSelectProps {
  label?: string
  value: string | number
  onChange: (e: { target: { value: string } }) => void
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  size?: 'small' | 'default' | 'large'
  error?: string
  [key: string]: any
}

const FormSelect = memo(({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  disabled = false,
  className = '',
  id,
  size = 'default',
  error,
  ...props
}: FormSelectProps) => {
  const handleChange = useCallback((e: any) => {
    if (onChange) onChange(e)
  }, [onChange])

  return (
    <div className={`w-full min-w-0 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <CustomSelect
        id={id}
        value={value}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        size={size}
        {...props}
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
})

FormSelect.displayName = 'FormSelect'

export default FormSelect