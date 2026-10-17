// frontend/src/features/finance/CurrencyInput.tsx
import React, { useCallback, useRef, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formatNumberForInput,
  parseFormattedNumber,
  toEnglishDigits,
  CURRENCY_META
} from './currencyHelpers'

interface CurrencyInputProps {
  value: number | string | null | undefined
  onChange: (e: { target: { value: number | string; name: string } }) => void
  currency?: string
  placeholder?: string
  label?: React.ReactNode
  required?: boolean
  disabled?: boolean
  autoFocus?: boolean
  showCurrencyLabel?: boolean
  size?: 'small' | 'default' | 'large'
  maxDecimals?: number | null
}

const CurrencyInput = memo(({
  value,
  onChange,
  currency = 'IRR',
  placeholder = '',
  label,
  required = false,
  disabled = false,
  autoFocus = false,
  showCurrencyLabel = true,
  size = 'default',
  maxDecimals = null
}: CurrencyInputProps) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const inputRef = useRef<HTMLInputElement>(null)

  const meta = CURRENCY_META[currency] || CURRENCY_META.IRR
  const decimals = maxDecimals !== null ? maxDecimals : (meta.decimals ?? 0)
  const allowDecimals = decimals > 0

  const displayValue = useMemo(() => {
    if (value === '' || value === null || value === undefined) return ''
    const num = parseFormattedNumber(value)
    if (num === 0) return ''

    if (allowDecimals && !Number.isInteger(num)) {
      const fixed = num.toFixed(decimals).replace(/\.?0+$/, '')
      return formatNumberForInput(fixed, isPersian)
    }
    return formatNumberForInput(num, isPersian)
  }, [value, isPersian, allowDecimals, decimals])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const englishRaw = toEnglishDigits(raw)
    let cleaned: string

    if (allowDecimals) {
      cleaned = englishRaw.replace(/[^\d.]/g, '')
      const parts = cleaned.split('.')
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('')
      }
      const dotIdx = cleaned.indexOf('.')
      if (dotIdx !== -1 && decimals > 0) {
        const intPart = cleaned.slice(0, dotIdx)
        const decPart = cleaned.slice(dotIdx + 1, dotIdx + 1 + decimals)
        cleaned = intPart + '.' + decPart
      }
    } else {
      cleaned = englishRaw.replace(/[^\d]/g, '')
    }

    if (onChange) {
      if (cleaned === '' || cleaned === '.') {
        onChange({ target: { value: '', name: 'amount' } })
      } else {
        const num = allowDecimals ? parseFloat(cleaned) : parseInt(cleaned, 10)
        onChange({
          target: {
            value: isNaN(num) ? '' : num,
            name: 'amount'
          }
        })
      }
    }
  }, [onChange, allowDecimals, decimals])

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const num = parseFormattedNumber(e.target.value)
    if (num === 0) {
      e.target.select()
    }
  }, [])

  const sizeClasses = {
    small: 'px-2 py-1.5 text-xs',
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
          ref={inputRef}
          type="text"
          inputMode={allowDecimals ? 'decimal' : 'numeric'}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
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