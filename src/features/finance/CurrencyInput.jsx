import React, { useState, useEffect, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumberForInput, parseFormattedNumber, CURRENCY_META } from './currencyHelpers'

const CurrencyInput = memo(({
  value,
  onChange,
  currency = 'IRR',
  placeholder = '0',
  label,
  required = false,
  disabled = false,
  autoFocus = false,
  showCurrencyLabel = true,
  size = 'default'
}) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  
  const [displayValue, setDisplayValue] = useState('')

  // ✅ همگام‌سازی مقدار نمایشی با value خارجی
  useEffect(() => {
    if (value === '' || value === null || value === undefined) {
      setDisplayValue('')
    } else {
      // ✅ اگه مقدار خارجی تغییر کرد، فرمت کن
      const formatted = formatNumberForInput(String(value), isPersian)
      setDisplayValue(formatted)
    }
  }, [value, isPersian])

  const handleChange = useCallback((e) => {
    const rawInput = e.target.value
    
    // ✅ فرمت با جداکننده
    const formatted = formatNumberForInput(rawInput, isPersian)
    setDisplayValue(formatted)
    
    // ✅ مقدار واقعی رو به parent بفرست
    const numericValue = parseFormattedNumber(rawInput)
    if (onChange) {
      onChange({ target: { value: numericValue, name: 'amount' } })
    }
  }, [isPersian, onChange])

  const meta = CURRENCY_META[currency] || CURRENCY_META.IRR

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    default: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-xl font-bold'
  }

  const sizeClass = sizeClasses[size] || sizeClasses.default

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`
            w-full ${sizeClass} 
            ${showCurrencyLabel && currency ? 'pe-20' : ''}
            border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
            transition-colors text-center
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ fontFamily: 'inherit' }}
        />
        
        {showCurrencyLabel && meta && (
          <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {meta.label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
})

CurrencyInput.displayName = 'CurrencyInput'

export default CurrencyInput