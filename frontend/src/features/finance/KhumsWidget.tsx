import React, { memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FiPercent, FiArrowRight } from 'react-icons/fi'
import { selectKhumsCalculation } from './financeSlice'
import { formatCompact } from './currencyHelpers'
import type { RootState } from '../../app/store'

const KhumsWidget = memo(() => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  // ✅ دفاعی: اگر finance وجود نداشت، مقدار پیش‌فرض
  const finance = useSelector((s: RootState) => (s as any).finance)
  const settings = finance?.islamicSettings ?? { khumsYearStart: null, khumsPaid: 0 }

  // ✅ دفاعی: try/catch برای selector
  let calculation: { khums: number; sahmImam: number; sahmSadat: number } = {
    khums: 0,
    sahmImam: 0,
    sahmSadat: 0,
  }
  try {
    calculation = useSelector(selectKhumsCalculation) as any
  } catch {
    // اگر selector خطا داد، از پیش‌فرض استفاده کن
  }

  const hasYearStart = !!settings.khumsYearStart
  const totalPaid = settings.khumsPaid || 0
  const remaining = Math.max(0, (calculation?.khums || 0) - totalPaid)

  if (!hasYearStart) {
    return (
      <div className="text-center py-3">
        <FiPercent size={20} className="mx-auto text-teal-300 mb-2" />
        <div className="text-[10px] text-gray-500 mb-2">
          {isPersian ? 'سال خمسی تنظیم نشده' : 'Khums year not set'}
        </div>
        <Link to="/finance" className="inline-flex items-center gap-1 text-[10px] text-teal-600 hover:underline">
          <span>{isPersian ? 'تنظیمات' : 'Settings'}</span>
          <FiArrowRight size={10} />
        </Link>
      </div>
    )
  }

  if ((calculation?.khums || 0) === 0) {
    return (
      <div className="text-center py-3">
        <FiPercent size={20} className="mx-auto text-green-400 mb-2" />
        <div className="text-[10px] text-green-600 font-medium">
          {isPersian ? 'خمس واجب نیست' : 'No Khums due'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
          <FiPercent size={14} className="text-teal-600 dark:text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-gray-500">{isPersian ? 'خمس قابل پرداخت' : 'Khums Due'}</div>
          <div className="text-base font-bold text-teal-600 dark:text-teal-400 truncate">
            {formatCompact(remaining, isPersian)}
          </div>
        </div>
      </div>

      {totalPaid > 0 && (
        <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded text-[10px] flex items-center justify-between">
          <span className="text-green-700 dark:text-green-400">{isPersian ? 'پرداخت‌شده' : 'Paid'}</span>
          <span className="font-bold text-green-700 dark:text-green-400">{formatCompact(totalPaid, isPersian)}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5 text-[9px]">
        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
          <div className="text-blue-600 dark:text-blue-400 mb-0.5">{isPersian ? 'سهم امام' : 'Imam'}</div>
          <div className="font-bold text-blue-700 dark:text-blue-300 truncate">{formatCompact(calculation.sahmImam, isPersian)}</div>
        </div>
        <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded text-center">
          <div className="text-purple-600 dark:text-purple-400 mb-0.5">{isPersian ? 'سهم سادات' : 'Sadat'}</div>
          <div className="font-bold text-purple-700 dark:text-purple-300 truncate">{formatCompact(calculation.sahmSadat, isPersian)}</div>
        </div>
      </div>

      <Link to="/finance" className="flex items-center justify-center gap-1 text-[10px] text-teal-600 dark:text-teal-400 hover:underline">
        <span>{isPersian ? 'محاسبه و پرداخت' : 'Calculate & Pay'}</span>
        <FiArrowRight size={10} />
      </Link>
    </div>
  )
})

KhumsWidget.displayName = 'KhumsWidget'
export default KhumsWidget