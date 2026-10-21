import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FiCheckCircle, FiCalendar, FiDollarSign, FiAlertTriangle, FiUser } from 'react-icons/fi'
import Modal from './Modal'
import Button from './Button'
import { CURRENCY_META, formatNumber } from '../../features/finance/currencyHelpers'
import { formatLongDateByLang } from '../../utils/formatters'
import type { CurrencyCode } from '../../types/finance'

interface PaymentConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  planTitle: string
  counterparty?: string | null
  installmentIndex: number
  totalInstallments?: number
  amount: number
  currency: CurrencyCode | string
  dueDate: string
  isOverdue?: boolean
  loading?: boolean
}

const PaymentConfirmModal: React.FC<PaymentConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  planTitle,
  counterparty,
  installmentIndex,
  totalInstallments,
  amount,
  currency,
  dueDate,
  isOverdue = false,
  loading = false,
}) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const meta = CURRENCY_META[currency as CurrencyCode] || CURRENCY_META.IRR

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      title={isPersian ? 'تأیید پرداخت قسط' : 'Confirm Installment Payment'}
    >
      <div className="space-y-4">
        {/* هدر */}
        <div className={`flex items-start gap-3 p-4 rounded-xl ${
          isOverdue
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            isOverdue
              ? 'bg-red-100 dark:bg-red-900/40'
              : 'bg-emerald-100 dark:bg-emerald-900/40'
          }`}>
            {isOverdue
              ? <FiAlertTriangle size={24} className="text-red-600 dark:text-red-400" />
              : <FiCheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-base ${
              isOverdue
                ? 'text-red-700 dark:text-red-300'
                : 'text-emerald-700 dark:text-emerald-300'
            }`}>
              {isOverdue
                ? (isPersian ? 'قسط عقب‌افتاده' : 'Overdue Installment')
                : (isPersian ? 'قسط سررسید' : 'Installment Due')}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
              {planTitle}
              {counterparty && ` — ${counterparty}`}
            </p>
          </div>
        </div>

        {/* جزئیات */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-2.5">
          <Row
            icon={<FiCheckCircle size={14} />}
            label={isPersian ? 'شماره قسط' : 'Installment #'}
            value={
              <span className="font-bold text-gray-900 dark:text-white">
                {formatNumber(installmentIndex + 1, isPersian)}
                {totalInstallments ? ` ${isPersian ? 'از' : 'of'} ${formatNumber(totalInstallments, isPersian)}` : ''}
              </span>
            }
          />
          <Row
            icon={<FiCalendar size={14} />}
            label={isPersian ? 'سررسید' : 'Due Date'}
            value={
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {formatLongDateByLang(dueDate)}
              </span>
            }
          />
          <Row
            icon={<FiDollarSign size={14} />}
            label={isPersian ? 'مبلغ' : 'Amount'}
            value={
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                {formatNumber(amount, isPersian, meta.decimals)} {meta.label}
              </span>
            }
          />
        </div>

        {/* توضیح */}
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-center">
          {isPersian
            ? 'با تأیید، این قسط به‌عنوان پرداخت‌شده ثبت می‌شود و از موجودی حساب مرتبط کم می‌شود.'
            : 'By confirming, this installment will be marked as paid and deducted from the linked account.'}
        </p>

        {/* دکمه‌ها */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onConfirm}
            loading={loading}
            className="flex-1 !bg-emerald-600 hover:!bg-emerald-700"
          >
            <FiCheckCircle size={16} />
            <span>{isPersian ? 'بله، پرداخت شد' : 'Yes, Mark as Paid'}</span>
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {isPersian ? 'انصراف' : 'Cancel'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const Row: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon, label, value,
}) => (
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-sm">{value}</div>
  </div>
)

export default memo(PaymentConfirmModal)