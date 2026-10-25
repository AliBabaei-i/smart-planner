import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { toJalaali, toGregorian } from 'jalaali-js'

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]
const PERSIAN_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
const ENGLISH_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const ENGLISH_WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const toLocalStr = (date: Date | null): string => {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const fromLocalStr = (str: string): Date | null => {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

const isLeapJYear = (jy: number): boolean => {
  const a = jy % 33
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(a)
}

interface DatePickerProps {
  value?: string
  onChange: (e: { target: { value: string; name: string } }) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
  id?: string
  min?: string
  max?: string
}

interface GridCell {
  day: number
  date: Date
  dateStr: string
}

const DatePicker = memo(
  ({
    value = '',
    onChange,
    placeholder,
    label,
    required = false,
    disabled = false,
    className = '',
    id,
    min,
    max,
  }: DatePickerProps) => {
    const { t, i18n } = useTranslation()
    const isPersian =
      i18n.language === 'fa' || i18n.language?.startsWith('fa')
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedDate = useMemo(() => fromLocalStr(value), [value])

    // ✅ FIX: state مجزا برای شمسی و میلادی
    const [viewJYear, setViewJYear] = useState(() => {
      const base = selectedDate || new Date()
      return toJalaali(
        base.getFullYear(),
        base.getMonth() + 1,
        base.getDate()
      ).jy
    })
    const [viewJMonth, setViewJMonth] = useState(() => {
      const base = selectedDate || new Date()
      return toJalaali(
        base.getFullYear(),
        base.getMonth() + 1,
        base.getDate()
      ).jm
    })
    const [viewGY, setViewGY] = useState(
      () => (selectedDate || new Date()).getFullYear()
    )
    const [viewGM, setViewGM] = useState(
      () => (selectedDate || new Date()).getMonth() + 1
    )

    // ✅ فقط وقتی selectedDate واقعاً تغییر کرد، view را sync کن
    const lastSyncedValue = useRef<string | null>(null)
    useEffect(() => {
      if (!selectedDate) return
      const dateKey = toLocalStr(selectedDate)
      if (lastSyncedValue.current === dateKey) return
      lastSyncedValue.current = dateKey

      const j = toJalaali(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        selectedDate.getDate()
      )
      setViewJYear(j.jy)
      setViewJMonth(j.jm)
      setViewGY(selectedDate.getFullYear())
      setViewGM(selectedDate.getMonth() + 1)
    }, [selectedDate])

    // ✅ بستن با کلیک بیرون
    useEffect(() => {
      if (!isOpen) return
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // ✅ بستن با Escape
    useEffect(() => {
      if (!isOpen) return
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false)
      }
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen])

    const handleSelect = useCallback(
      (date: Date) => {
        onChange({ target: { value: toLocalStr(date), name: 'date' } })
        setIsOpen(false)
      },
      [onChange]
    )

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange({ target: { value: '', name: 'date' } })
        setIsOpen(false)
      },
      [onChange]
    )

    const handleToggle = useCallback(() => {
      if (disabled) return
      setIsOpen((prev) => !prev)
    }, [disabled])

    // ✅ FIX: ناوبری بر اساس state شمسی/میلادی مستقل
    const goToPrevMonth = useCallback(() => {
      if (isPersian) {
        let newJMonth = viewJMonth - 1
        let newJYear = viewJYear
        if (newJMonth < 1) {
          newJMonth = 12
          newJYear--
        }
        setViewJMonth(newJMonth)
        setViewJYear(newJYear)
      } else {
        let m = viewGM - 1
        let y = viewGY
        if (m < 1) {
          m = 12
          y--
        }
        setViewGM(m)
        setViewGY(y)
      }
    }, [isPersian, viewJMonth, viewJYear, viewGM, viewGY])

    const goToNextMonth = useCallback(() => {
      if (isPersian) {
        let newJMonth = viewJMonth + 1
        let newJYear = viewJYear
        if (newJMonth > 12) {
          newJMonth = 1
          newJYear++
        }
        setViewJMonth(newJMonth)
        setViewJYear(newJYear)
      } else {
        let m = viewGM + 1
        let y = viewGY
        if (m > 12) {
          m = 1
          y++
        }
        setViewGM(m)
        setViewGY(y)
      }
    }, [isPersian, viewJMonth, viewJYear, viewGM, viewGY])

    const goToToday = useCallback(() => {
      const today = new Date()
      // ✅ view را هم به امروز sync کن
      const j = toJalaali(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate()
      )
      setViewJYear(j.jy)
      setViewJMonth(j.jm)
      setViewGY(today.getFullYear())
      setViewGM(today.getMonth() + 1)
      lastSyncedValue.current = toLocalStr(today)
      handleSelect(today)
    }, [handleSelect])

    const goToTomorrow = useCallback(() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      handleSelect(tomorrow)
    }, [handleSelect])

    // ✅ ساخت grid
    const grid = useMemo<(GridCell | null)[]>(() => {
      if (isPersian) {
        const daysInJMonth =
          viewJMonth <= 6
            ? 31
            : viewJMonth <= 11
            ? 30
            : isLeapJYear(viewJYear)
            ? 30
            : 29

        // تاریخ میلادی اول ماه شمسی
        const firstG = toGregorian(viewJYear, viewJMonth, 1)
        const firstDate = new Date(firstG.gy, firstG.gm - 1, firstG.gd)

        // شنبه = 0، یکشنبه = 1، ...، جمعه = 6
        const jsDay = firstDate.getDay() // 0=Sunday, 6=Saturday
        const firstDayIndex = (jsDay + 1) % 7

        const cells: (GridCell | null)[] = []
        for (let i = 0; i < firstDayIndex; i++) cells.push(null)
        for (let day = 1; day <= daysInJMonth; day++) {
          const g = toGregorian(viewJYear, viewJMonth, day)
          const date = new Date(g.gy, g.gm - 1, g.gd)
          cells.push({
            day,
            date,
            dateStr: toLocalStr(date),
          })
        }
        while (cells.length % 7 !== 0) cells.push(null)
        return cells
      } else {
        const daysInMonth = new Date(viewGY, viewGM, 0).getDate()
        const firstDate = new Date(viewGY, viewGM - 1, 1)
        const jsDay = firstDate.getDay()
        const firstDayIndex = (jsDay + 1) % 7

        const cells: (GridCell | null)[] = []
        for (let i = 0; i < firstDayIndex; i++) cells.push(null)
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(viewGY, viewGM - 1, day)
          cells.push({
            day,
            date,
            dateStr: toLocalStr(date),
          })
        }
        while (cells.length % 7 !== 0) cells.push(null)
        return cells
      }
    }, [isPersian, viewJYear, viewJMonth, viewGY, viewGM])

    const monthTitle = useMemo(() => {
      if (isPersian) {
        return `${PERSIAN_MONTHS[viewJMonth - 1]} ${viewJYear}`
      }
      return `${ENGLISH_MONTHS[viewGM - 1]} ${viewGY}`
    }, [isPersian, viewJYear, viewJMonth, viewGY, viewGM])

    const displayLabel = useMemo(() => {
      if (!selectedDate)
        return placeholder || t('tasks.form.selectDate') || 'انتخاب تاریخ'
      if (isPersian) {
        const j = toJalaali(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          selectedDate.getDate()
        )
        return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(
          j.jd
        ).padStart(2, '0')}`
      }
      return toLocalStr(selectedDate)
    }, [selectedDate, isPersian, placeholder, t])

    const todayStr = toLocalStr(new Date())
    const weekdays = isPersian ? PERSIAN_WEEKDAYS : ENGLISH_WEEKDAYS

    return (
      <div ref={containerRef} className={`relative w-full ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            id={id}
            aria-disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleToggle()
              }
            }}
            className={`
              w-full px-3 py-2 pe-9 border rounded-lg shadow-sm
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              text-start flex items-center gap-2
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              transition-colors min-h-[42px] text-sm
              ${
                disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
              }
              ${
                isOpen
                  ? 'border-primary-500 ring-2 ring-primary-500'
                  : 'border-gray-300 dark:border-gray-600'
              }
            `}
          >
            <FiCalendar
              size={14}
              className={`flex-shrink-0 ${
                selectedDate ? 'text-primary-500' : 'text-gray-400'
              }`}
            />
            <span
              className={`truncate flex-1 ${
                !selectedDate ? 'text-gray-400 dark:text-gray-500' : ''
              }`}
            >
              {displayLabel}
            </span>
          </div>

          {selectedDate && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1 rounded transition-colors z-10 bg-white dark:bg-gray-700"
              title={t('actions.delete') || 'حذف'}
              tabIndex={-1}
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 top-full mt-1 start-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 w-[280px] animate-fade-in">
            {/* هدر ماه */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={goToPrevMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                aria-label="previous month"
              >
                {isPersian ? (
                  <FiChevronRight size={18} />
                ) : (
                  <FiChevronLeft size={18} />
                )}
              </button>
              <div className="font-semibold text-sm text-gray-900 dark:text-white">
                {monthTitle}
              </div>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                aria-label="next month"
              >
                {isPersian ? (
                  <FiChevronLeft size={18} />
                ) : (
                  <FiChevronRight size={18} />
                )}
              </button>
            </div>

            {/* روزهای هفته */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekdays.map((d, i) => (
                <div
                  key={i}
                  className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* grid روزها */}
            <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1">
              {grid.map((cell, idx) => {
                if (!cell)
                  return <div key={`e-${idx}`} className="aspect-square" />
                const isSelected = value === cell.dateStr
                const isToday = cell.dateStr === todayStr
                const isDisabled =
                  (min && cell.dateStr < min) || (max && cell.dateStr > max)
                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    disabled={!!isDisabled}
                    onClick={() => !isDisabled && handleSelect(cell.date)}
                    className={`
                      aspect-square rounded-lg text-xs font-medium transition-colors
                      flex items-center justify-center min-w-0
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                      ${
                        isSelected
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : isToday
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {cell.day}
                  </button>
                )
              })}
            </div>

            {/* اکشن‌های سریع */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={goToToday}
                className="flex-1 px-2 py-1.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
              >
                {t('actions.today') || 'امروز'}
              </button>
              <button
                type="button"
                onClick={goToTomorrow}
                className="flex-1 px-2 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {isPersian ? 'فردا' : 'Tomorrow'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'

export default DatePicker