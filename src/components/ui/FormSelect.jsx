import React from 'react'
import { FiChevronDown } from 'react-icons/fi'

const FormSelect = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder,
  required = false,
  disabled = false,
  className = '',
  id,
  ...props 
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`w-full min-w-0 ${className}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap"
        >
          {label} {required && '*'}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="w-full px-3 py-2 pe-9 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed truncate"
          style={{ fontFamily: 'inherit' }}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <FiChevronDown 
          size={16} 
          className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  )
}

export default FormSelect