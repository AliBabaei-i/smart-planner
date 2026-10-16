import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { FiChevronDown, FiCheck } from 'react-icons/fi'

const CustomSelect = memo(({
  value,
  onChange,
  options = [],
  placeholder = 'انتخاب کنید',
  className = '',
  disabled = false,
  name,
  id,
  size = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  const selectedOption = useMemo(
    () => options.find(opt => String(opt.value) === String(value)) || null,
    [options, value]
  )

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  const handleSelect = useCallback((option) => {
    if (onChange) {
      onChange({ target: { value: option.value, name } })
    }
    setIsOpen(false)
    setHighlightedIndex(-1)
  }, [onChange, name])

  const handleToggle = useCallback(() => {
    if (disabled) return
    setIsOpen(prev => {
      if (!prev) {
        const idx = options.findIndex(o => String(o.value) === String(value))
        setHighlightedIndex(idx >= 0 ? idx : 0)
      }
      return !prev
    })
  }, [disabled, options, value])

  const handleKeyDown = useCallback((e) => {
    if (disabled) return
    if (!isOpen) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => Math.min(prev + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleSelect(options[highlightedIndex])
        }
        break
      case 'Tab':
        setIsOpen(false)
        break
      default:
        break
    }
  }, [disabled, isOpen, options, highlightedIndex, handleSelect])

  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-option]')
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [isOpen, highlightedIndex])

  const sizeClasses = {
    small: 'px-2 py-1.5 text-xs min-h-[32px]',
    default: 'px-3 py-2 text-sm min-h-[42px]',
    large: 'px-4 py-2.5 text-base min-h-[48px]'
  }
  const sizeClass = sizeClasses[size] || sizeClasses.default

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          w-full border rounded-lg shadow-sm
          bg-white dark:bg-gray-700
          text-gray-900 dark:text-white
          text-start flex items-center justify-between gap-2
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors
          ${sizeClass}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 dark:border-gray-600'}
        `}
        style={{ fontFamily: 'inherit' }}
      >
        <span 
  className={`truncate flex-1 text-start ${!selectedOption ? 'text-gray-400 dark:text-gray-500' : ''}`}
  title={selectedOption?.label || ''}
>
  {selectedOption ? selectedOption.label : placeholder}
</span>
        <FiChevronDown
          size={16}
          className={`flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in"
        >
          {options.length === 0 ? (
            <div className="p-3 text-sm text-gray-400 dark:text-gray-500 text-center">
              گزینه‌ای وجود ندارد
            </div>
          ) : (
            options.map((option, index) => {
              const isSelected = String(option.value) === String(value)
              const isHighlighted = index === highlightedIndex
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  data-option
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full px-3 py-2 text-start text-sm
                    flex items-center justify-between gap-2 transition-colors
                    ${isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                      : isHighlighted
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <FiCheck size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
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