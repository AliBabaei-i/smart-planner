import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useMemo, memo } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCheckCircle,
  FiCircle,
  FiCalendar,
  FiEdit2,
  FiPlus
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import {
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS_SHORT,
  ENGLISH_MONTHS,
  ENGLISH_WEEKDAYS_SHORT,
  getMonthGrid,
  getTodayStr,
  getJalaliDayInfo,
  getPersianMonthName,
  getEnglishMonthName
} from '../../utils/jalaliCalendar'
import { toJalaali, toGregorian } from 'jalaali-js'
import { formatTimeByLang } from '../../utils/formatters'

// ✅ FIX: تعریف یک کلاس ثابت برای گرید ۷ ستونه که در همه جا استفاده می‌شه
const GRID_7_COLS = 'grid w-full gap-1 grid-cols-[repeat(7,minmax(0,1fr))]'

const CalendarView = ({
  tasks = [],
  projects = [],
  selectedDate,
  onSelectDate,
  onEditTask,
  onCreateTask
}) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  // ✅ state برای ماه جاری
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1) // برای میلادی
  const [viewJYear, setViewJYear] = useState(toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate()).jy)
  const [viewJMonth, setViewJMonth] = useState(toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate()).jm)

  const todayStr = getTodayStr()

  // ✅ ساخت Grid ماه بر اساس زبان
  const grid = useMemo(() => {
    if (isPersian) {
      return getMonthGrid(viewJYear, viewJMonth)
    }
    // برای میلادی: ساخت دستی
    const firstDay = new Date(viewYear, viewMonth - 1, 1)
    const monthLength = new Date(viewYear, viewMonth, 0).getDate()
    // روز اول ماه (0=یکشنبه)
    const jsDay = firstDay.getDay()
    // تبدیل به 0=شنبه
    const firstDayIndex = (jsDay + 1) % 7

    const arr = []
    for (let i = 0; i < firstDayIndex; i++) {
      arr.push({ empty: true, key: `empty-s-${i}` })
    }
    for (let day = 1; day <= monthLength; day++) {
      const date = new Date(viewYear, viewMonth - 1, day)
      arr.push({
        empty: false,
        day,
        date,
        dateStr: `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        key: `day-${day}`
      })
    }
    const remaining = 7 - (arr.length % 7)
    if (remaining < 7) {
      for (let i = 0; i < remaining; i++) {
        arr.push({ empty: true, key: `empty-e-${i}` })
      }
    }
    return arr
  }, [isPersian, viewJYear, viewJMonth, viewYear, viewMonth])

  // ✅ عنوان ماه
  const monthTitle = isPersian
    ? `${getPersianMonthName(viewJMonth)} ${viewJYear}`
    : `${getEnglishMonthName(viewMonth)} ${viewYear}`

  // ✅ ناوبری
  const goToPreviousMonth = () => {
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
      let newMonth = viewMonth - 1
      let newYear = viewYear
      if (newMonth < 1) {
        newMonth = 12
        newYear--
      }
      setViewMonth(newMonth)
      setViewYear(newYear)
    }
  }

  const goToNextMonth = () => {
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
      let newMonth = viewMonth + 1
      let newYear = viewYear
      if (newMonth > 12) {
        newMonth = 1
        newYear++
      }
      setViewMonth(newMonth)
      setViewYear(newYear)
    }
  }

  const goToToday = () => {
    const today = new Date()
    const { jy, jm } = toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate())
    setViewJYear(jy)
    setViewJMonth(jm)
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth() + 1)
    onSelectDate(today)
  }

  // ✅ کارهای هر روز
  const getTasksForDateStr = (dateStr) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      return task.dueDate === dateStr
    })
  }

  const weekdays = isPersian ? PERSIAN_WEEKDAYS_SHORT : ENGLISH_WEEKDAYS_SHORT

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* هدر ماه */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="small" onClick={goToToday}>
              <FiCalendar size={14} />
              <span>{t('actions.today')}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
              title={t('actions.previous')}
            >
              {isPersian ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
            </button>

            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white min-w-[200px] text-center">
              {monthTitle}
            </h2>

            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
              title={t('actions.next')}
            >
              {isPersian ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.filter(t => t.dueDate && !t.completed).length} {t('tasks.status.pending')}
          </div>
        </div>
      </Card>

      {/* تقویم */}
      <Card className="p-4 min-w-0 overflow-hidden">
        {/* ✅ FIX: هدر روزهای هفته با minmax(0,1fr) و truncate */}
        <div className={`${GRID_7_COLS} mb-2`}>
          {weekdays.map((day, idx) => (
            <div
              key={idx}
              className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2 min-w-0 truncate"
            >
              {day}
            </div>
          ))}
        </div>

        {/* ✅ FIX: Grid روزها با minmax(0,1fr) */}
        <div className={GRID_7_COLS}>
          {grid.map((cell) => {
            if (cell.empty) {
              return <div key={cell.key} className="aspect-square min-w-0" />
            }

            const isToday = cell.dateStr === todayStr
            const dayTasks = getTasksForDateStr(cell.dateStr)
            const completedCount = dayTasks.filter(t => t.completed).length
            const pendingCount = dayTasks.length - completedCount
            const hasTasks = dayTasks.length > 0
            const allCompleted = hasTasks && pendingCount === 0

            return (
              <button
                key={cell.key}
                onClick={() => onSelectDate(cell.date)}
                // ✅ FIX: min-w-0 w-full overflow-hidden اضافه شد
                className={`
                  aspect-square p-1.5 rounded-lg transition-all text-start
                  flex flex-col items-stretch
                  min-w-0 w-full overflow-hidden
                  hover:bg-blue-50 dark:hover:bg-blue-900/20
                  border-2
                  ${isToday 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                    : 'border-transparent bg-gray-50 dark:bg-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                title={`${dayTasks.length} ${t('tasks.title')}`}
              >
                {/* شماره روز */}
                <div className={`
                  text-sm font-bold mb-0.5 flex-shrink-0
                  ${isToday 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-900 dark:text-white'
                  }
                `}>
                  {cell.day}
                </div>

                {/* تسک‌ها */}
                {hasTasks && (
                  // ✅ FIX: min-w-0 w-full اضافه شد
                  <div className="flex flex-col gap-0.5 flex-1 min-h-0 min-w-0 w-full overflow-hidden">
                    {dayTasks.slice(0, 2).map((task, idx) => {
                      const project = projects.find(p => p.id === task.projectId)
                      return (
                        <div
                          key={task.id}
                          // ✅ FIX: w-full min-w-0 اضافه شد
                          className="text-[9px] md:text-[10px] px-1 py-0.5 rounded truncate text-white leading-tight w-full min-w-0"
                          style={{
                            backgroundColor: project?.color || '#3b82f6',
                            opacity: task.completed ? 0.5 : 1,
                            textDecoration: task.completed ? 'line-through' : 'none'
                          }}
                        >
                          {task.dueTime !== null && task.dueTime !== undefined && (
                            <span className="font-mono me-0.5">
                              {task.dueTime.toString().padStart(2, '0')}:
                            </span>
                          )}
                          {task.title}
                        </div>
                      )
                    })}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight truncate">
                        +{dayTasks.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* کارهای روز انتخاب شده */}
      <Card className="p-4 min-w-0">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 min-w-0">
            <FiCalendar size={18} className="text-blue-600 flex-shrink-0" />
            <span className="truncate">
              {selectedDate.toLocaleDateString(isPersian ? 'fa-IR' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </h3>
          <Button size="small" onClick={() => onCreateTask(selectedDate)}>
            <FiPlus size={14} />
            <span>{t('tasks.new')}</span>
          </Button>
        </div>

        {(() => {
          const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
          const dayTasks = getTasksForDateStr(dateStr).sort((a, b) => (a.dueTime || 0) - (b.dueTime || 0))

          if (dayTasks.length === 0) {
            return (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <FiCalendar size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">{t('planning.empty')}</p>
              </div>
            )
          }

          return (
            <div className="space-y-2">
              {dayTasks.map(task => {
                const project = projects.find(p => p.id === task.projectId)
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group min-w-0"
                  >
                    {task.completed ? (
                      <FiCheckCircle size={18} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <FiCircle size={18} className="text-gray-400 flex-shrink-0" />
                    )}

                    {task.dueTime !== null && task.dueTime !== undefined && (
                      <span className="text-xs font-mono px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 flex-shrink-0">
                        {task.dueTime.toString().padStart(2, '0')}:۰۰
                      </span>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${
                        task.completed 
                          ? 'line-through text-gray-400 dark:text-gray-500' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </div>
                      {project && (
                        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.name}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onEditTask(task)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      title={t('actions.edit')}
                    >
                      <FiEdit2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </Card>
    </div>
  )
}

export default memo(CalendarView)