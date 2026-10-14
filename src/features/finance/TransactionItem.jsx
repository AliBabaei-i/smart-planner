import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiTrendingUp, FiTrendingDown, FiRepeat,
  FiEdit2, FiClock, FiCalendar, FiTag
} from 'react-icons/fi'
import { formatNumber, CURRENCY_META } from './currencyHelpers'
import { formatDateByLang } from '../../utils/formatters'

const TransactionItem = memo(({ transaction, account, toAccount, onEdit, isCompact = false }) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const { type, amount, currency, category, description, date, time } = transaction

  const typeConfig = useMemo(() => {
    switch (type) {
      case 'income':
        return {
          Icon: FiTrendingUp,
          color: '#10b981',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-600 dark:text-green-400',
          sign: '+'
        }
      case 'expense':
        return {
          Icon: FiTrendingDown,
          color: '#ef4444',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-600 dark:text-red-400',
          sign: '−'
        }
      case 'transfer':
        return {
          Icon: FiRepeat,
          color: '#3b82f6',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-600 dark:text-blue-400',
          sign: '↔'
        }
      default:
        return {
          Icon: FiRepeat,
          color: '#6b7280',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          textColor: 'text-gray-600 dark:text-gray-400',
          sign: ''
        }
    }
  }, [type])

  const currencyMeta = CURRENCY_META[currency] || CURRENCY_META.IRR

  // ✅ عنوان
  const title = useMemo(() => {
    if (description) return description
    if (type === 'transfer') {
      return isPersian 
        ? `انتقال از ${account?.name || '؟'} به ${toAccount?.name || '؟'}`
        : `Transfer from ${account?.name || '?'} to ${toAccount?.name || '?'}`
    }
    return category || (isPersian ? 'بدون عنوان' : 'Untitled')
  }, [description, type, category, account, toAccount, isPersian])

  const Icon = typeConfig.Icon

  if (isCompact) {
    return (
      <div
        className={`flex items-center gap-2.5 py-2 px-1 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded transition-colors ${
          onEdit ? 'cursor-pointer' : ''
        }`}
        onClick={() => onEdit?.(transaction)}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig.bgColor}`}>
          <Icon size={14} className={typeConfig.textColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-900 dark:text-white truncate">
            {title}
          </div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400">
            {formatDateByLang(date)}
          </div>
        </div>
        <div className={`font-medium text-sm ${typeConfig.textColor} flex-shrink-0`}>
          {typeConfig.sign}{formatNumber(amount, isPersian, currencyMeta.decimals)}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group ${
        onEdit ? 'cursor-pointer' : ''
      }`}
      onClick={() => onEdit?.(transaction)}
    >
      {/* آیکون */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig.bgColor}`}>
        <Icon size={18} className={typeConfig.textColor} />
      </div>

      {/* اطلاعات */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {title}
            </div>

            {/* متادیتا */}
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              {account && (
                <span className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: account.color }}
                  />
                  {account.name}
                </span>
              )}

              <span className="flex items-center gap-1">
                <FiCalendar size={10} />
                {formatDateByLang(date)}
              </span>

              {time && (
                <span className="flex items-center gap-1">
                  <FiClock size={10} />
                  {time}
                </span>
              )}

              {type !== 'transfer' && category && (
                <span className="flex items-center gap-1">
                  <FiTag size={10} />
                  {category}
                </span>
              )}
            </div>
          </div>

          {/* مبلغ */}
          <div className="flex items-start gap-2 flex-shrink-0">
            <div className={`font-bold ${typeConfig.textColor}`}>
              {typeConfig.sign}{formatNumber(amount, isPersian, currencyMeta.decimals)}
              <div className="text-[10px] font-normal text-gray-500 dark:text-gray-400 text-end mt-0.5">
                {currencyMeta.label}
              </div>
            </div>

            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(transaction) }}
                className="text-gray-400 hover:text-emerald-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title={isPersian ? 'ویرایش' : 'Edit'}
              >
                <FiEdit2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

TransactionItem.displayName = 'TransactionItem'

export default TransactionItem