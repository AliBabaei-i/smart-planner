import React, { useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import {
  FiCheckCircle, FiCircle, FiEdit2, FiCalendar,
  FiUser, FiTrendingUp, FiTrendingDown, FiAlertTriangle,
  FiClock, FiDollarSign
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { payPlanDue, selectPlanDues, PLAN_TYPES } from './financeSlice'
import {
  formatNumber,
  formatCompact,
  CURRENCY_META
} from './currencyHelpers'
import { formatDateByLang } from '../../utils/formatters'

const PlanCard = memo(({ plan, onEdit }) => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  // ✅ همه سررسیدها (derived — از plan محاسبه می‌شن، نه ذخیره)
  const allDues = useMemo(() => selectPlanDues(plan), [plan])

  // ✅ پرداخت‌های ثبت‌شده
  const paidDues = useSelector(state =>
    (state.finance.planDues || []).filter(d => d.planId === plan.id)
  )

  // ✅ Map برای دسترسی سریع: index → payment info
  const paidMap = useMemo(() => {
    const map = new Map()
    paidDues.forEach(d => {
      if (d.paid) map.set(d.index, d)
    })
    return map
  }, [paidDues])

  // ✅ امروز
  const todayStr = useMemo(
    () => new Date().toISOString().split('T')[0],
    []
  )

  // ✅ سررسید بعدی (اولین قسط پرداخت‌نشده با تاریخ >= امروز)
  const nextDue = useMemo(() => {
    return allDues.find(d => !paidMap.has(d.index) && d.dueDate >= todayStr)
  }, [allDues, paidMap, todayStr])

  // ✅ سررسیدهای عقب‌افتاده
  const overdueDues = useMemo(() => {
    return allDues.filter(d => !paidMap.has(d.index) && d.dueDate < todayStr)
  }, [allDues, paidMap, todayStr])

  // ✅ آمار پیشرفت
  const progress = useMemo(() => {
    const paidCount = paidDues.filter(d => d.paid).length
    const total = plan.installmentsCount || 1
    return {
      paidCount,
      total,
      percentage: total > 0 ? Math.min(100, (paidCount / total) * 100) : 0,
      isComplete: paidCount >= total
    }
  }, [paidDues, plan.installmentsCount])

  // ✅ مبالغ
  const amounts = useMemo(() => {
    const total = Number(plan.totalAmount) || 0
    const perInstallment = Number(plan.installmentAmount) || Math.floor(total / (plan.installmentsCount || 1))
    const lastInstallment = Number(plan.lastInstallmentAmount) || 
      (total - perInstallment * ((plan.installmentsCount || 1) - 1))
    
    // ✅ مجموع پرداخت‌شده
    const paidAmount = paidDues
      .filter(d => d.paid)
      .reduce((sum, d) => sum + (Number(d.paidAmount) || 0), 0)
    
    // ✅ مجموع باقیمانده
    const remainingAmount = Math.max(0, total - paidAmount)

    return {
      total,
      perInstallment,
      lastInstallment,
      paidAmount,
      remainingAmount,
      hasDifferentLast: Math.abs(lastInstallment - perInstallment) > 1
    }
  }, [plan, paidDues])

  const planType = PLAN_TYPES[plan.type] || PLAN_TYPES.debt
  const isDebt = plan.type === 'debt' || plan.type === 'loan' || plan.type === 'installment'
  const currencyMeta = CURRENCY_META[plan.currency] || CURRENCY_META.IRR

  // ═══════════════════════════════════════════════
  // ✅ پرداخت قسط بعدی
  // ═══════════════════════════════════════════════
  const handlePayNextDue = useCallback(() => {
    if (!nextDue) return

    const confirmMsg = isPersian
      ? `قسط ${nextDue.index + 1} به مبلغ ${formatNumber(nextDue.amount, isPersian)} پرداخت شود؟`
      : `Pay installment ${nextDue.index + 1} (${formatNumber(nextDue.amount, isPersian)})?`

    if (!window.confirm(confirmMsg)) return

    dispatch(payPlanDue({
      planId: plan.id,
      dueIndex: nextDue.index,
      paidAmount: nextDue.amount,
      paidDate: todayStr
    }))

    toast.success(
      isPersian ? 'قسط پرداخت شد' : 'Installment paid',
      { position: 'bottom-left', autoClose: 2500 }
    )
  }, [nextDue, plan.id, todayStr, dispatch, isPersian])

  // ═══════════════════════════════════════════════
  // ✅ پرداخت یک قسط عقب‌افتاده
  // ═══════════════════════════════════════════════
  const handlePayOverdue = useCallback((due) => {
    const confirmMsg = isPersian
      ? `قسط ${due.index + 1} (${formatNumber(due.amount, isPersian)}) پرداخت شود؟`
      : `Pay overdue installment ${due.index + 1}?`

    if (!window.confirm(confirmMsg)) return

    dispatch(payPlanDue({
      planId: plan.id,
      dueIndex: due.index,
      paidAmount: due.amount,
      paidDate: todayStr
    }))

    toast.success(
      isPersian ? 'قسط عقب‌افتاده پرداخت شد' : 'Overdue installment paid',
      { position: 'bottom-left', autoClose: 2500 }
    )
  }, [plan.id, todayStr, dispatch, isPersian])

  return (
    <Card className="p-4 group">
      {/* ═══════════════════════════════════ */}
      {/* هدر */}
      {/* ═══════════════════════════════════ */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${planType.color}20` }}
          >
            {isDebt
              ? <FiTrendingDown size={18} style={{ color: planType.color }} />
              : <FiTrendingUp size={18} style={{ color: planType.color }} />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">
              {plan.title}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ backgroundColor: `${planType.color}20`, color: planType.color }}
              >
                {isPersian ? planType.label : plan.type}
              </span>
              {plan.counterparty && (
                <span className="flex items-center gap-1">
                  <FiUser size={10} />
                  {plan.counterparty}
                </span>
              )}
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={() => onEdit(plan)}
            className="text-gray-400 hover:text-emerald-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            title={isPersian ? 'ویرایش' : 'Edit'}
          >
            <FiEdit2 size={14} />
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════ */}
      {/* Progress Bar */}
      {/* ═══════════════════════════════════ */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            {isPersian ? 'پرداخت‌شده' : 'Paid'}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {formatNumber(progress.paidCount, isPersian)} / {formatNumber(progress.total, isPersian)}
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${progress.percentage}%`,
              backgroundColor: planType.color
            }}
          />
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-end">
          {formatNumber(Math.round(progress.percentage), isPersian)}%
        </div>
      </div>

      {/* ═══════════════════════════════════ */}
      {/* جزئیات مبالغ */}
      {/* ═══════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
          <div className="text-gray-500 dark:text-gray-400 mb-0.5">
            {isPersian ? 'مبلغ کل' : 'Total'}
          </div>
          <div className="font-bold text-gray-900 dark:text-white">
            {formatCompact(amounts.total, isPersian)}
          </div>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
          <div className="text-gray-500 dark:text-gray-400 mb-0.5">
            {isPersian ? 'هر قسط' : 'Per installment'}
          </div>
          <div className="font-bold text-gray-900 dark:text-white">
            {formatCompact(amounts.perInstallment, isPersian)}
          </div>
        </div>
      </div>

      {/* ✅ اگه قسط آخر متفاوته */}
      {amounts.hasDifferentLast && (
        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-3 flex items-start gap-2">
          <FiAlertTriangle size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
            {isPersian
              ? `قسط آخر: ${formatNumber(amounts.lastInstallment, isPersian)} (باقیمانده)`
              : `Last installment: ${formatNumber(amounts.lastInstallment, isPersian)} (remainder)`}
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════ */}
      {/* پرداخت‌شده / باقیمانده */}
      {/* ═══════════════════════════════════ */}
      {amounts.paidAmount > 0 && (
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg mb-3 flex items-center justify-between text-xs">
          <span className="text-green-700 dark:text-green-300 flex items-center gap-1">
            <FiCheckCircle size={11} />
            {isPersian ? 'پرداخت‌شده' : 'Paid'}
          </span>
          <span className="font-bold text-green-700 dark:text-green-300">
            {formatCompact(amounts.paidAmount, isPersian)}
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════ */}
      {/* سررسید بعدی */}
      {/* ═══════════════════════════════════ */}
      {nextDue && !progress.isComplete && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FiCalendar size={12} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1.5 flex-wrap">
                  <span>
                    {isPersian 
                      ? `قسط ${formatNumber(nextDue.index + 1, isPersian)}` 
                      : `Installment ${nextDue.index + 1}`}
                  </span>
                  {/* ✅ نشانگر قسط آخر */}
                  {nextDue.isLast && (
                    <span className="text-[9px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded-full">
                      {isPersian ? 'آخر' : 'Last'}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                  {formatDateByLang(nextDue.dueDate)} — {formatNumber(nextDue.amount, isPersian)} {currencyMeta.label}
                </div>
              </div>
            </div>
            <Button
              size="small"
              onClick={handlePayNextDue}
              className="!bg-blue-600 hover:!bg-blue-700 flex-shrink-0"
            >
              <FiCheckCircle size={12} />
              <span>{isPersian ? 'پرداخت' : 'Pay'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════ */}
      {/* قسط‌های عقب‌افتاده */}
      {/* ═══════════════════════════════════ */}
      {overdueDues.length > 0 && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <FiAlertTriangle size={11} className="text-red-500" />
            <span className="text-xs font-medium text-red-700 dark:text-red-300">
              {formatNumber(overdueDues.length, isPersian)} {isPersian ? 'قسط عقب‌افتاده' : 'overdue'}
            </span>
          </div>
          <div className="space-y-1.5">
            {overdueDues.slice(0, 2).map(due => (
              <div key={due.id} className="flex items-center justify-between gap-2 text-[10px]">
                <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                  <FiClock size={9} />
                  {isPersian ? `قسط ${due.index + 1}` : `#${due.index + 1}`} — {formatDateByLang(due.dueDate)}
                </span>
                <button
                  onClick={() => handlePayOverdue(due)}
                  className="text-red-600 dark:text-red-400 hover:underline font-medium"
                >
                  {isPersian ? 'پرداخت' : 'Pay'}
                </button>
              </div>
            ))}
            {overdueDues.length > 2 && (
              <div className="text-[10px] text-red-500 ps-4">
                + {formatNumber(overdueDues.length - 2, isPersian)} {isPersian ? 'قسط دیگر' : 'more'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════ */}
      {/* تسویه شد */}
      {/* ═══════════════════════════════════ */}
      {progress.isComplete && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
            <FiCheckCircle size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-green-700 dark:text-green-300">
              {isPersian ? 'تسویه شد!' : 'Settled!'}
            </div>
            <div className="text-[10px] text-green-600 dark:text-green-400">
              {isPersian 
                ? `مجموع پرداختی: ${formatNumber(amounts.paidAmount, isPersian)} ${currencyMeta.label}`
                : `Total paid: ${formatNumber(amounts.paidAmount, isPersian)}`}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
})

PlanCard.displayName = 'PlanCard'

export default PlanCard