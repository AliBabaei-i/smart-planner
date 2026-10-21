import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FormSelect from '../../components/ui/FormSelect'

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

const getDaysInMonth = (month: number): number => {
  if (month <= 6) return 31
  if (month <= 11) return 30
  return 29
}

interface MonthDayPickerProps {
  /** "M-D" — مثلاً "1-1" برای فروردین ۱ */
  value: string | null | undefined
  onChange: (value: string) => void
  label?: string
  disabled?: boolean
}

/**
 * ✅ انتخاب‌گر روز و ماه (بدون سال) برای سال خمسی
 * ذخیره می‌شود به فرمت "M-D" — مثلاً "1-1"
 */
const MonthDayPicker: React.FC<MonthDayPickerProps> = ({
  value,
  onChange,
  label,
  disabled = false
}) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [month, day] = useMemo(() => {
    if (!value) return [1, 1]
    const parts = value.split('-').map(Number)
    return [parts[0] || 1, parts[1] || 1]
  }, [value])

  const maxDays = getDaysInMonth(month)

  const monthOptions = useMemo(
    () => PERSIAN_MONTHS.map((name, i) => ({
      value: String(i + 1),
      label: isPersian ? name : `Month ${i + 1}`
    })),
    [isPersian]
  )

  const dayOptions = useMemo(
    () => Array.from({ length: maxDays }, (_, i) => ({
      value: String(i + 1),
      label: isPersian ? String(i + 1).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]) : String(i + 1)
    })),
    [maxDays, isPersian]
  )

  const handleMonthChange = (newMonth: number) => {
    const clampedDay = Math.min(day, getDaysInMonth(newMonth))
    onChange(`${newMonth}-${clampedDay}`)
  }

  const handleDayChange = (newDay: number) => {
    onChange(`${month}-${newDay}`)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        <FormSelect
          value={String(month)}
          onChange={(e) => handleMonthChange(Number(e.target.value))}
          options={monthOptions}
          disabled={disabled}
        />
        <FormSelect
          value={String(day)}
          onChange={(e) => handleDayChange(Number(e.target.value))}
          options={dayOptions}
          disabled={disabled}
        />
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        {isPersian
          ? 'سال خمسی هر سال در همین تاریخ شمسی تکرار می‌شود'
          : 'Khums year repeats annually on this date'}
      </p>
    </div>
  )
}

export default MonthDayPicker