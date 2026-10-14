import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiCalendar, FiChevronLeft, FiChevronRight, FiX
} from 'react-icons/fi'
import { toJalaali, toGregorian } from 'jalaali-js'

// ✅ ماه‌های شمسی و میلادی
const PERSIAN_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']
const PERSIAN_WEEKDAYS = ['ش','ی','د','س','چ','پ','ج']
const ENGLISH_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const ENGLISH_WEEKDAYS = ['S','M','T','W','T','F','S']

// ✅ تبدیل Date به رشته YYYY-MM-DD (محلی)
const toLocalStr = (date) => {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ✅ تبدیل رشته YYYY-MM-DD به Date
const fromLocalStr = (str) => {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ✅ چک سال کبیسه شمسی
const isLeapJYear = (jy) => {
  const a = jy % 33
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(a)
}

const DatePicker = memo(({
  value = '',
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  className = '',
  id,
  min,
  max
}) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // ✅ تاریخ انتخاب‌شده
  const selectedDate = useMemo(() => fromLocalStr(value), [value])

  // ✅ نمای فعلی (ماه/سال)
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)

  // ✅ sync view با مقدار انتخاب‌شده
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear())
      setViewMonth(selectedDate.getMonth() + 1)
    }
  }, [selectedDate])

  // ✅ بستن با کلیک بیرون
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // ✅ Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  // ✅ انتخاب تاریخ
  const handleSelect = useCallback((date) => {
    if (onChange) {
      onChange({ target: { value: toLocalStr(date), name: 'dueDate' } })
    }
    setIsOpen(false)
  }, [onChange])

  // ✅ پاک کردن
  const handleClear = useCallback((e) => {
    e?.stopPropagation()
    if (onChange) {
      onChange({ target: { value: '', name: 'dueDate' } })
    }
    setIsOpen(false)
  }, [onChange])

  // ✅ Toggle
  const handleToggle = useCallback(() => {
    if (disabled) return
    setIsOpen(prev => !prev)
  }, [disabled])

  // ✅ کیبورد روی trigger
  const handleTriggerKeyDown = useCallback((e) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(prev => !prev)
    }
  }, [disabled])

  // ✅ ناوبری ماه
  const goToPrevMonth = useCallback(() => {
    if (isPersian) {
      const j = toJalaali(viewYear, viewMonth, 1)
      let newJMonth = j.jm - 1
      let newJYear = j.jy
      if (newJMonth < 1) { newJMonth = 12; newJYear-- }
      const g = toGregorian(newJYear, newJMonth, 1)
      setViewYear(g.gy); setViewMonth(g.gm)
    } else {
      let m = viewMonth - 1
      let y = viewYear
      if (m < 1) { m = 12; y-- }
      setViewMonth(m); setViewYear(y)
    }
  }, [isPersian, viewYear, viewMonth])

  const goToNextMonth = useCallback(() => {
    if (isPersian) {
      const j = toJalaali(viewYear, viewMonth, 1)
      let newJMonth = j.jm + 1
      let newJYear = j.jy
      if (newJMonth > 12) { newJMonth = 1; newJYear++ }
      const g = toGregorian(newJYear, newJMonth, 1)
      setViewYear(g.gy); setViewMonth(g.gm)
    } else {
      let m = viewMonth + 1
      let y = viewYear
      if (m > 12) { m = 1; y++ }
      setViewMonth(m); setViewYear(y)
    }
  }, [isPersian, viewYear, viewMonth])

  const goToToday = useCallback(() => {
    const today = new Date()
    handleSelect(today)
  }, [handleSelect])

  // ✅ گرید روزهای ماه
  const grid = useMemo(() => {
    if (isPersian) {
      const j = toJalaali(viewYear, viewMonth, 1)
      const firstG = toGregorian(j.jy, j.jm, 1)
      const firstDate = new Date(firstG.gy, firstG.gm - 1, firstG.gd)
      const daysInJMonth = j.jm <= 6 ? 31 : j.jm <= 11 ? 30 : (isLeapJYear(j.jy) ? 30 : 29)

      const jsDay = firstDate.getDay()
      const firstDayIndex = (jsDay + 1) % 7

      const cells = []
      for (let i = 0; i < firstDayIndex; i++) cells.push(null)
      for (let day = 1; day <= daysInJMonth; day++) {
        const g = toGregorian(j.jy, j.jm, day)
        cells.push({
          day,
          date: new Date(g.gy, g.gm - 1, g.gd),
          dateStr: `${g.gy}-${String(g.gm).padStart(2,'0')}-${String(g.gd).padStart(2,'0')}`
        })
      }
      while (cells.length % 7 !== 0) cells.push(null)
      return cells
    } else {
      const firstDate = new Date(viewYear, viewMonth - 1, 1)
      const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
      const jsDay = firstDate.getDay()
      const firstDayIndex = jsDay

      const cells = []
      for (let i = 0; i < firstDayIndex; i++) cells.push(null)
      for (let day = 1; day <= daysInMonth; day++) {
        cells.push({
          day,
          date: new Date(viewYear, viewMonth - 1, day),
          dateStr: `${viewYear}-${String(viewMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`
        })
      }
      while (cells.length % 7 !== 0) cells.push(null)
      return cells
    }
  }, [isPersian, viewYear, viewMonth])

  // ✅ عنوان ماه
  const monthTitle = useMemo(() => {
    if (isPersian) {
      const j = toJalaali(viewYear, viewMonth, 1)
      return `${PERSIAN_MONTHS[j.jm - 1]} ${j.jy}`
    }
    return `${ENGLISH_MONTHS[viewMonth - 1]} ${viewYear}`
  }, [isPersian, viewYear, viewMonth])

  // ✅ لیبل نمایش داده
  const displayLabel = useMemo(() => {
    if (!selectedDate) return placeholder || t('tasks.form.selectDate') || 'انتخاب تاریخ'
    if (isPersian) {
      const j = toJalaali(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate())
      return `${j.jy}/${String(j.jm).padStart(2,'0')}/${String(j.jd).padStart(2,'0')}`
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

      {/* ✅ FIX: wrapper relative برای trigger + clear */}
      <div className="relative">
        {/* trigger — div با role=button، نه button */}
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          id={id}
          aria-disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleTriggerKeyDown}
          className={`
            w-full px-3 py-2 pe-9 border rounded-lg shadow-sm
            bg-white dark:bg-gray-700
            text-gray-900 dark:text-white
            text-start flex items-center gap-2
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors min-h-[42px] text-sm
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'}
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300 dark:border-gray-600'}
          `}
        >
          <FiCalendar
            size={14}
            className={`flex-shrink-0 ${selectedDate ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <span className={`truncate flex-1 ${!selectedDate ? 'text-gray-400 dark:text-gray-500' : ''}`}>
            {displayLabel}
          </span>
        </div>

        {/* clear button — sibling مستقل، نه child */}
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
          {/* هدر ناوبری */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              {isPersian ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
            </button>
            <div className="font-semibold text-sm text-gray-900 dark:text-white">
              {monthTitle}
            </div>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              {isPersian ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
            </button>
          </div>

          {/* روزهای هفته */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekdays.map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* گرید روزها */}
          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell, idx) => {
              if (!cell) return <div key={`e-${idx}`} className="aspect-square" />

              const isSelected = value === cell.dateStr
              const isToday = cell.dateStr === todayStr
              const isDisabled = (min && cell.dateStr < min) || (max && cell.dateStr > max)

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && handleSelect(cell.date)}
                  className={`
                    aspect-square rounded-lg text-xs font-medium transition-colors
                    flex items-center justify-center
                    ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    ${isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : isToday
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          {/* دکمه‌های سریع */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={goToToday}
              className="flex-1 px-2 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              {t('actions.today') || 'امروز'}
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                handleSelect(tomorrow)
              }}
              className="flex-1 px-2 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              فردا
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

DatePicker.displayName = 'DatePicker'

export default DatePicker