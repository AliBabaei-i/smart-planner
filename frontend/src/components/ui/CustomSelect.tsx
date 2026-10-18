import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { FiChevronDown, FiCheck } from 'react-icons/fi'

export interface SelectOption {
  value: string | number
  label: string
}

interface CustomSelectProps {
  id?: string
  value: string | number
  onChange: (e: { target: { value: string } }) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  size?: 'small' | 'default' | 'large'
  className?: string
}

const CustomSelect = memo(({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'انتخاب کنید',
  disabled = false,
  size = 'default',
  className = '',
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => String(opt.value) === String(value))

  // ✅ بستن با کلیک بیرون
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // ✅ بستن با Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  const handleSelect = useCallback((optionValue: string | number) => {
    onChange({ target: { value: String(optionValue) } })
    setIsOpen(false)
  }, [onChange])

  const handleToggle = useCallback(() => {
    if (disabled) return
    setIsOpen(prev => !prev)
  }, [disabled])

  const sizeClasses = {
    small: 'px-2 py-1.5 text-xs min-h-[32px]',
    default: 'px-3 py-2 text-sm min-h-[42px]',
    large: 'px-4 py-3 text-base min-h-[48px]',
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`
          w-full ${sizeClasses[size]}
          border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          text-start flex items-center justify-between gap-2
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'}
          ${isOpen ? 'border-primary-500 ring-2 ring-primary-500' : ''}
        `}
      >
        <span className={`truncate flex-1 ${!selectedOption ? 'text-gray-400 dark:text-gray-500' : ''}`}>
          {selectedOption?.label || placeholder}
        </span>
        <FiChevronDown
          size={14}
          className={`flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 top-full mt-1 start-0 end-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto py-1 animate-fade-in"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400 text-center">
              گزینه‌ای وجود ندارد
            </div>
          ) : (
            options.map(option => {
              const isSelected = String(option.value) === String(value)
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full text-start px-3 py-2 text-sm transition-colors flex items-center justify-between gap-2
                    ${isSelected
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <FiCheck size={14} className="flex-shrink-0" />}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
})

CustomSelect.displayName = 'CustomSelect'

export default CustomSelect