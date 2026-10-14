import React, { useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FiPercent, FiArrowRight, FiAlertCircle } from 'react-icons/fi'
import { selectKhumsCalculation } from './financeSlice''
import { formatCompact } from './currencyHelpers'

const KhumsWidget = memo(() => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const settings = useSelector(state => state.finance?.islamicSettings || {})
  const calculation = useSelector(selectKhumsCalculation)

  const hasYearStart = !!settings.khumsYearStart
  const totalPaid = settings.khumsPaid || 0
  const remaining = Math.max(0, calculation.khums - totalPaid)

  if (!hasYearStart) {
    return (
      <div className="text-center py-3">
        <FiPercent size={24} className="mx-auto text-teal-300 mb-2" />
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {isPersian ? 'سال خمسی تنظیم نشده' : 'Khums year not set'}
        </div>
        <Link
          to="/finance"
          className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
        >
          <span>{isPersian ? 'تنظیمات' : 'Settings'}</span>
          <FiArrowRight size={10} />
        </Link>
      </div>
    )
  }

  if (calculation.khums === 0) {
    return (
      <div className="text-center py-3">
        <FiPercent size={24} className="mx-auto text-green-400 mb-2" />
        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
          {isPersian ? 'خمس واجب نیست' : 'No Khums due'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
          <FiPercent size={18} className="text-teal-600 dark:text-teal-400" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isPersian ? 'خمس قابل پرداخت' : 'Khums Due'}
          </div>
          <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
            {formatCompact(remaining, isPersian)}
          </div>
        </div>
      </div>

      {totalPaid > 0 && (
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs flex items-center justify-between">
          <span className="text-green-700 dark:text-green-300">
            {isPersian ? 'پرداخت‌شده' : 'Paid'}
          </span>
          <span className="font-bold text-green-700 dark:text-green-300">
            {formatCompact(totalPaid, isPersian)}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
          <div className="text-blue-600 dark:text-blue-400 mb-0.5">
            {isPersian ? 'سهم امام' : 'Imam'}
          </div>
          <div className="font-bold text-blue-700 dark:text-blue-300">
            {formatCompact(calculation.sahmImam, isPersian)}
          </div>
        </div>
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-center">
          <div className="text-purple-600 dark:text-purple-400 mb-0.5">
            {isPersian ? 'سهم سادات' : 'Sadat'}
          </div>
          <div className="font-bold text-purple-700 dark:text-purple-300">
            {formatCompact(calculation.sahmSadat, isPersian)}
          </div>
        </div>
      </div>

      <Link
        to="/finance"
        className="flex items-center justify-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline"
      >
        <span>{isPersian ? 'محاسبه و پرداخت' : 'Calculate & Pay'}</span>
        <FiArrowRight size={10} />
      </Link>
    </div>
  )
})

KhumsWidget.displayName = 'KhumsWidget'

export default KhumsWidget