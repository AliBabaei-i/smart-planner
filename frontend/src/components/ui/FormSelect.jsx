import React, { useCallback, memo } from 'react'
import CustomSelect from './CustomSelect'

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
}) => {
  const handleChange = useCallback((e) => {
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