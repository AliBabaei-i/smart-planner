import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumber, CURRENCY_META } from './currencyHelpers'

const CurrencyDisplay = memo(({ 
  amount = 0, 
  currency = 'IRR', 
  className = '',
  showLabel = true,
  isCompact = false,
  showSign = false,
  type = null
}) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const meta = CURRENCY_META[currency] || CURRENCY_META.IRR
  const formatted = formatNumber(amount, isPersian, meta.decimals)

  // علامت
  let sign = ''
  let colorClass = ''
  if (showSign && type) {
    if (type === 'income') { sign = '+'; colorClass = 'text-green-600 dark:text-green-400' }
    else if (type === 'expense') { sign = '−'; colorClass = 'text-red-600 dark:text-red-400' }
    else if (type === 'transfer') { sign = '↔'; colorClass = 'text-blue-600 dark:text-blue-400' }
  }

  return (
    <span className={`${className} ${colorClass} whitespace-nowrap`}>
      {sign}{formatted}
      {showLabel && (
        <span className="text-xs opacity-70 ms-1">
          {meta.label}
        </span>
      )}
    </span>
  )
})

CurrencyDisplay.displayName = 'CurrencyDisplay'

export default CurrencyDisplay