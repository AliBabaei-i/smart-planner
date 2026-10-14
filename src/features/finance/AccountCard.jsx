import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiCreditCard, FiDollarSign, FiBriefcase, FiHome,
  FiTrendingUp, FiPackage, FiZap, FiEdit2
} from 'react-icons/fi'
import Card from '../../../components/ui/Card'
import { formatNumber, formatCompact, CURRENCY_META } from './currencyHelpers'

const ACCOUNT_ICONS = {
  bank: FiCreditCard,
  cash: FiDollarSign,
  gold: FiPackage,
  silver: FiPackage,
  crypto: FiZap,
  stock: FiTrendingUp,
  property: FiHome,
  other: FiBriefcase
}

const AccountCard = memo(({ account, onEdit, isCompact = false }) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const Icon = ACCOUNT_ICONS[account.type] || FiBriefcase
  const currencyMeta = CURRENCY_META[account.currency] || CURRENCY_META.IRR
  const balance = account.balance || 0
  const isNegative = balance < 0

  return (
    <Card className={`relative overflow-hidden group ${isCompact ? 'p-3' : 'p-4'}`}>
      {/* نوار رنگی بالا */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: account.color }}
      />

      <div className={`flex items-start gap-3 ${isCompact ? 'mt-1' : 'mt-2'}`}>
        {/* آیکون */}
        <div
          className={`rounded-lg flex items-center justify-center flex-shrink-0 ${isCompact ? 'w-9 h-9' : 'w-11 h-11'}`}
          style={{ backgroundColor: `${account.color}20` }}
        >
          <Icon
            size={isCompact ? 16 : 20}
            style={{ color: account.color }}
          />
        </div>

        {/* اطلاعات */}
        <div className="flex-1 min-w-0">
          <div className={`font-medium text-gray-900 dark:text-white truncate ${isCompact ? 'text-sm' : ''}`}>
            {account.name}
          </div>
          <div className={`text-gray-500 dark:text-gray-400 mt-0.5 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
            {currencyMeta.label}
          </div>
        </div>

        {/* دکمه ویرایش */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-emerald-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            title={isPersian ? 'ویرایش' : 'Edit'}
          >
            <FiEdit2 size={14} />
          </button>
        )}
      </div>

      {/* موجودی */}
      <div className={`mt-3 ${isCompact ? 'mt-2' : 'mt-4'}`}>
        <div
          className={`font-bold ${isCompact ? 'text-base' : 'text-xl'} ${
            isNegative
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {isCompact 
            ? formatCompact(balance, isPersian)
            : formatNumber(balance, isPersian, currencyMeta.decimals)
          }
        </div>
        {!isCompact && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {currencyMeta.label}
          </div>
        )}
      </div>
    </Card>
  )
})

AccountCard.displayName = 'AccountCard'

export default AccountCard