import React, { memo, type ReactNode, type SelectHTMLAttributes } from 'react'
import { FiChevronDown } from 'react-icons/fi'

export interface SelectOption {
  value: string | number
  label: string
}

export interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: ReactNode  // ✅ FIX: string | JSX
  error?: string
  options?: SelectOption[]
  placeholder?: string
  size?: 'small' | 'default' | 'large'
  required?: boolean
}

const sizeClasses = {
  small: 'px-2 py-1.5 text-xs',
  default: 'px-3 py-2 text-sm',
  large: 'px-4 py-3 text-base'
}

const FormSelect = memo(({
  label,
  error,
  options = [],
  placeholder,
  size = 'default',
  required = false,
  className = '',
  id,
  disabled,
  ...props
}: FormSelectProps) => {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ms-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          className={`
            w-full border rounded-lg shadow-sm
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            transition-colors appearance-none pe-9
            ${sizeClasses[size]}
            ${error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `.trim()}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <FiChevronDown
          size={14}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
})

FormSelect.displayName = 'FormSelect'
export default FormSelect