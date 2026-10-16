import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  FiCalendar,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiClock,
  FiCheckCircle,
  FiCircle,
  FiGrid,
  FiList,
  FiTag,
  FiFlag,
  FiFolder
} from 'react-icons/fi'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import TaskForm from '../tasks/TaskForm'
import CalendarView from './CalendarView'
import { 
  getPersianDayName, 
  getPersianWeekDates, 
  getPersianWeekRange,
  formatPersianDate,
  formatLongPersianDate,
  addDaysToPersianDate,
  getPersianDayNumber
} from '../../utils/persianDate'
import { formatDateByLang, getDayNameByLang } from '../../utils/formatters'

// ✅ Constants خارج از کامپوننت (جلوگیری از بازتعریف)
const ROW_HEIGHT = 80
const MAX_VISIBLE_TASKS = 2
const TOOLTIP_DELAY = 300
const HOURS = Array.from({ length: 19 }, (_, i) => i + 5)
const TIME_SLOTS = HOURS.map(hour => ({
  hour,
  display: `${hour}:00`
}))

const getLocalDateStr = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ═══════════════════════════════════════════
// ✅ کامپوننت Tooltip — memo شده
// ═══════════════════════════════════════════
const TaskTooltip = memo(({ task, project, position, t }) => {
  if (!task) return null

  const tooltipWidth = 280
  const offset = 12
  let left = position.x + offset
  let top = position.y + offset

  if (left + tooltipWidth > window.innerWidth - 8) {
    left = position.x - tooltipWidth - offset
  }
  if (top + 200 > window.innerHeight - 8) {
    top = position.y - 200
  }

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ left: `${left}px`, top: `${top}px`, width: `${tooltipWidth}px` }}
      dir="rtl"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-1" style={{ backgroundColor: project?.color || '#3b82f6' }} />

        <div className="p-3 space-y-2">
          <div className="flex items-start gap-2">
            {task.completed ? (
              <FiCheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <FiCircle size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <h4 className={`text-sm font-bold leading-snug ${
              task.completed 
                ? 'line-through text-gray-400 dark:text-gray-500' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {task.title}
            </h4>
          </div>

          {project && (
            <div className="flex items-center gap-1.5 text-xs">
              <FiFolder size={11} className="text-gray-400 flex-shrink-0" />
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
              <span className="text-gray-600 dark:text-gray-400 truncate">{project.name}</span>
            </div>
          )}

          {task.dueTime !== null && task.dueTime !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <FiClock size={11} className="flex-shrink-0" />
              <span className="font-mono">
                {task.dueTime.toString().padStart(2, '0')}:۰۰
                {task.timeEstimate && ` — ${task.timeEstimate} ${t('tasks.time.minutes')}`}
              </span>
            </div>
          )}

          {task.priority && task.priority !== 'medium' && (
            <div className="flex items-center gap-1.5 text-xs">
              <FiFlag size={11} className={`flex-shrink-0 ${
                task.priority === 'high' ? 'text-red-500' :
                task.priority === 'low' ? 'text-green-500' :
                'text-yellow-500'
              }`} />
              <span className="text-gray-600 dark:text-gray-400">
                {t(`tasks.priority.${task.priority}`)}
              </span>
            </div>
          )}

          {task.description && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                {task.description}
              </p>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {task.tags.map((tag, i) => (
                <span 
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1"
                >
                  <FiTag size={9} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="text-[10px] text-gray-500 dark:text-gray-400 pt-1 flex items-center gap-1">
              <FiList size={10} />
              <span>
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} 
                {' '}{t('tasks.form.subtasks')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
})
TaskTooltip.displayName = 'TaskTooltip'

// ═══════════════════════════════════════════
// ✅ کامپوننت Cell — memo شده (133 بار رندر می‌شه!)
// ═══════════════════════════════════════════
const TimeSlotCell = memo(({
  tasksInSlot,
  isCurrent,
  isSelected,
  onCellClick,
  onEditTask,
  onTaskMouseEnter,
  onTaskMouseLeave,
  getProjectColor
}) => {
  const visibleTasks = tasksInSlot.slice(0, MAX_VISIBLE_TASKS)
  const hiddenCount = tasksInSlot.length - visibleTasks.length

  return (
    <td 
      className={`p-0 border-s border-gray-200 dark:border-gray-700 align-top cursor-pointer transition-all ${
        isCurrent ? 'bg-green-50 dark:bg-green-900/20' : ''
      } ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
      style={{ 
        position: 'relative',
        height: `${ROW_HEIGHT}px`,
        overflow: 'hidden'
      }}
      onClick={onCellClick}
    >
      <div 
        className="absolute flex flex-col gap-0.5 overflow-hidden"
        style={{ top: '4px', left: '4px', right: '4px', bottom: '4px' }}
      >
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            onClick={(e) => {
              e.stopPropagation()
              onEditTask(task)
            }}
            onMouseEnter={(e) => onTaskMouseEnter(e, task)}
            onMouseLeave={onTaskMouseLeave}
            className="text-xs px-1.5 py-1 rounded text-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0 min-w-0"
            style={{ 
              backgroundColor: getProjectColor(task.projectId),
              opacity: task.completed ? 0.5 : 1
            }}
          >
            <div className={`font-medium truncate ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </div>
          </div>
        ))}
        
        {hiddenCount > 0 && (
          <div className="text-[10px] text-gray-600 dark:text-gray-300 text-center font-medium bg-gray-100 dark:bg-gray-700 rounded py-0.5 flex-shrink-0 truncate">
            +{hiddenCount}
          </div>
        )}
        
        {tasksInSlot.length === 0 && (
          <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <FiPlus size={14} className="text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>
    </td>
  )
})
TimeSlotCell.displayName = 'TimeSlotCell'

// ═══════════════════════════════════════════
// ✅ کامپوننت WeekGrid — memo شده
// ═══════════════════════════════════════════
const WeekGrid = memo(({
  weekDates,
  tasksByDateHour,
  projectsById,
  selectedDate,
  isRTL,
  t,
  onSelectDate,
  onCellClick,
  onEditTask,
  onTaskMouseEnter,
  onTaskMouseLeave,
  getDayName,
  getDayNumber,
  formatDate,
  isToday,
  isSelected
}) => {
  return (
    <table className="w-full table-fixed" style={{ minWidth: '900px' }}>
      <colgroup>
        <col style={{ width: '70px' }} />
        {weekDates.map((_, i) => <col key={i} />)}
      </colgroup>

      <thead className="sticky top-0 z-20">
        <tr>
          <th className="p-2 border-s border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <FiClock size={12} />
              <span>{t('planning.hour')}</span>
            </span>
          </th>
          {weekDates.map((date, index) => {
            const dateStr = getLocalDateStr(date)
            const today = isToday(date)
            const selected = isSelected(date)
            return (
              <th 
                key={index}
                className={`p-3 border-s border-gray-200 dark:border-gray-700 text-center cursor-pointer transition-colors ${
                  today ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800'
                } ${selected ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                onClick={() => onSelectDate(date)}
              >
                <div className="space-y-1">
                  <div className={`text-xs ${
                    today ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {getDayName(date)}
                  </div>
                  <div className={`text-lg font-bold ${
                    today ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {getDayNumber(date)}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(date)}
                  </div>
                </div>
              </th>
            )
          })}
        </tr>
      </thead>

      <tbody>
        {TIME_SLOTS.map((timeSlot, timeIndex) => (
          <tr 
            key={timeIndex} 
            className="border-t border-gray-200 dark:border-gray-700"
            style={{ height: `${ROW_HEIGHT}px` }}
          >
            <td className="p-2 border-s border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 font-medium align-top">
              {timeSlot.display}
            </td>
            
            {weekDates.map((date, dateIndex) => {
              const dateStr = getLocalDateStr(date)
              const key = `${dateStr}-${timeSlot.hour}`
              const tasksInSlot = tasksByDateHour.get(key) || []
              const isCurrent = isToday(date) && new Date().getHours() === timeSlot.hour
              const isSelectedCell = isSelected(date)
              
              return (
                <TimeSlotCell
                  key={key}
                  tasksInSlot={tasksInSlot}
                  isCurrent={isCurrent}
                  isSelected={isSelectedCell}
                  onCellClick={() => onCellClick(date, timeSlot.hour)}
                  onEditTask={onEditTask}
                  onTaskMouseEnter={onTaskMouseEnter}
                  onTaskMouseLeave={onTaskMouseLeave}
                  getProjectColor={(projectId) => projectsById.get(projectId)?.color || '#3b82f6'}
                />
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
})
WeekGrid.displayName = 'WeekGrid'

// ═══════════════════════════════════════════
// ✅ کامپوننت اصلی
// ═══════════════════════════════════════════
const PlanningPage = () => {
  const { t, i18n } = useTranslation()
  const { tasks = [] } = useSelector(state => state.tasks)
  const { projects = [] } = useSelector(state => state.projects)
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('week')

  const [hoveredTask, setHoveredTask] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const hoverTimeoutRef = useRef(null)

  const isRTL = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  // ✅ useMemo: کلید date-hour → لیست تسک‌ها
  // بر اساس 47 تسک × 19 ساعت × 7 روز = 6251 عملیات → 0
  const tasksByDateHour = useMemo(() => {
    const map = new Map()
    for (const task of tasks) {
      if (!task.dueDate) continue
      if (task.dueTime === null || task.dueTime === undefined) continue
      const key = `${task.dueDate}-${parseInt(task.dueTime)}`
      let arr = map.get(key)
      if (!arr) {
        arr = []
        map.set(key, arr)
      }
      arr.push(task)
    }
    return map
  }, [tasks])

  // ✅ useMemo: projectId → project
  const projectsById = useMemo(() => {
    const map = new Map()
    for (const p of projects) map.set(p.id, p)
    return map
  }, [projects])

  // ✅ useMemo: تسک‌های هر روز (برای لیست پایین)
  const tasksByDate = useMemo(() => {
    const map = new Map()
    for (const task of tasks) {
      if (!task.dueDate) continue
      let arr = map.get(task.dueDate)
      if (!arr) {
        arr = []
        map.set(task.dueDate, arr)
      }
      arr.push(task)
    }
    return map
  }, [tasks])

  // ✅ useMemo: تاریخ‌های هفته
  const weekDates = useMemo(() => {
    if (isRTL) return getPersianWeekDates(currentWeek)
    
    const dates = []
    const start = new Date(currentWeek)
    const day = start.getDay()
    start.setDate(start.getDate() - day)
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      d.setHours(12, 0, 0, 0)
      dates.push(d)
    }
    return dates
  }, [currentWeek, isRTL])

  const weekRangeLabel = useMemo(() => {
    if (isRTL) {
      const { startLong, endLong } = getPersianWeekRange(currentWeek)
      return `${startLong} - ${endLong}`
    }
    return `${formatDateByLang(weekDates[0])} - ${formatDateByLang(weekDates[6])}`
  }, [currentWeek, weekDates, isRTL])

  const selectedDateStr = useMemo(() => getLocalDateStr(selectedDate), [selectedDate])
  
  const selectedDayTasks = useMemo(() => {
    const dayTasks = tasksByDate.get(selectedDateStr) || []
    return [...dayTasks].sort((a, b) => (a.dueTime || 0) - (b.dueTime || 0))
  }, [tasksByDate, selectedDateStr])

  const pendingTasksCount = useMemo(
    () => tasks.filter(t => t.dueDate && !t.completed).length,
    [tasks]
  )

  // ✅ useCallback: ناوبری
  const goToPreviousWeek = useCallback(() => {
    if (isRTL) {
      setCurrentWeek(prev => addDaysToPersianDate(prev, -7))
    } else {
      setCurrentWeek(prev => {
        const newWeek = new Date(prev)
        newWeek.setDate(newWeek.getDate() - 7)
        return newWeek
      })
    }
  }, [isRTL])

  const goToNextWeek = useCallback(() => {
    if (isRTL) {
      setCurrentWeek(prev => addDaysToPersianDate(prev, 7))
    } else {
      setCurrentWeek(prev => {
        const newWeek = new Date(prev)
        newWeek.setDate(newWeek.getDate() + 7)
        return newWeek
      })
    }
  }, [isRTL])

  const goToToday = useCallback(() => {
    const today = new Date()
    setCurrentWeek(today)
    setSelectedDate(today)
  }, [])

  // ✅ useCallback: Tooltip
  const handleTaskMouseEnter = useCallback((e, task) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = { x: rect.right, y: rect.top }

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTask(task)
      setTooltipPos(pos)
    }, TOOLTIP_DELAY)
  }, [])

  const handleTaskMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setHoveredTask(null)
  }, [])

  // ✅ useCallback: هندلرها
  const handleTimeSlotClick = useCallback((date, hour) => {
    setSelectedTimeSlot({ date, hour })
    setEditingTask(null)
    setShowTaskForm(true)
  }, [])

  const handleEditTask = useCallback((task) => {
    setEditingTask(task)
    setSelectedTimeSlot(null)
    setShowTaskForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowTaskForm(false)
    setSelectedTimeSlot(null)
    setEditingTask(null)
  }, [])

  const handleCreateFromCalendar = useCallback((date) => {
    setSelectedTimeSlot({ date, hour: null })
    setEditingTask(null)
    setShowTaskForm(true)
  }, [])

  const handleNewTaskClick = useCallback(() => {
    setEditingTask(null)
    setSelectedTimeSlot(null)
    setShowTaskForm(true)
  }, [])

  // ✅ توابع کمکی که از state استفاده نمی‌کنن — با useCallback
  const getDayName = useCallback((date) => {
    if (isRTL) return getPersianDayName(date)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[date.getDay()]
  }, [isRTL])

  const getDayNumber = useCallback((date) => {
    if (isRTL) return getPersianDayNumber(date)
    return date.getDate()
  }, [isRTL])

  const formatDate = useCallback((date) => {
    if (isRTL) return formatPersianDate(date)
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }, [isRTL])

  const formatLongDate = useCallback((date) => {
    if (isRTL) return formatLongPersianDate(date)
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }, [isRTL])

  const isToday = useCallback((date) => {
    return date.toDateString() === new Date().toDateString()
  }, [])

  const isSelected = useCallback((date) => {
    return date.toDateString() === new Date(selectedDate).toDateString()
  }, [selectedDate])

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCalendar className="text-blue-600" size={26} />
            <span>{t('planning.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {viewMode === 'week' ? weekRangeLabel : t('planning.monthView')}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 transition-colors text-sm flex items-center gap-1.5 ${
                viewMode === 'week'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiGrid size={16} />
              <span className="hidden sm:inline">{t('planning.week')}</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 transition-colors text-sm flex items-center gap-1.5 border-s border-gray-300 dark:border-gray-600 ${
                viewMode === 'month'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiList size={16} />
              <span className="hidden sm:inline">{t('planning.monthView')}</span>
            </button>
          </div>

          {viewMode === 'week' && (
            <>
              <Button variant="secondary" onClick={goToToday}>
                <FiCalendar size={16} />
                <span>{t('actions.today')}</span>
              </Button>
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={goToPreviousWeek}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {isRTL ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
                </button>
                <button
                  onClick={goToNextWeek}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 border-s border-gray-300 dark:border-gray-600"
                >
                  {isRTL ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
                </button>
              </div>
            </>
          )}

          <Button onClick={handleNewTaskClick}>
            <FiPlus size={16} />
            <span>{t('tasks.new')}</span>
          </Button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <CalendarView
          tasks={tasks}
          projects={projects}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onEditTask={handleEditTask}
          onCreateTask={handleCreateFromCalendar}
        />
      ) : (
        <>
          {/* جدول هفتگی */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-auto" style={{ maxHeight: '75vh' }}>
              <WeekGrid
                weekDates={weekDates}
                tasksByDateHour={tasksByDateHour}
                projectsById={projectsById}
                selectedDate={selectedDate}
                isRTL={isRTL}
                t={t}
                onSelectDate={setSelectedDate}
                onCellClick={handleTimeSlotClick}
                onEditTask={handleEditTask}
                onTaskMouseEnter={handleTaskMouseEnter}
                onTaskMouseLeave={handleTaskMouseLeave}
                getDayName={getDayName}
                getDayNumber={getDayNumber}
                formatDate={formatDate}
                isToday={isToday}
                isSelected={isSelected}
              />
            </div>
          </Card>

          {/* کارهای روز انتخاب شده */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 min-w-0">
                <FiCalendar size={18} className="text-blue-600 flex-shrink-0" />
                <span className="truncate">{getDayName(selectedDate)} - {formatLongDate(selectedDate)}</span>
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                {selectedDayTasks.length} {t('planning.taskCount')}
              </span>
            </div>
            
            <div className="space-y-3">
              {selectedDayTasks.map(task => {
                const project = projectsById.get(task.projectId)
                
                return (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors min-w-0"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-xs font-mono text-gray-500 dark:text-gray-400 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 flex items-center justify-center gap-1">
                        <FiClock size={10} />
                        <span>
                          {task.dueTime !== null && task.dueTime !== undefined 
                            ? `${task.dueTime.toString().padStart(2, '0')}:۰۰` 
                            : '--:--'}
                        </span>
                      </div>
                      
                      <button onClick={() => handleEditTask(task)} className="flex-shrink-0">
                        {task.completed ? (
                          <FiCheckCircle size={18} className="text-green-500" />
                        ) : (
                          <FiCircle size={18} className="text-gray-400 hover:text-blue-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span 
                            className={`font-semibold cursor-pointer hover:text-blue-600 truncate ${
                              task.completed 
                                ? 'line-through text-gray-400 dark:text-gray-500' 
                                : 'text-gray-900 dark:text-white'
                            }`}
                            onClick={() => handleEditTask(task)}
                          >
                            {task.title}
                          </span>
                          {project && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full text-white font-medium flex-shrink-0"
                              style={{ backgroundColor: project.color }}
                            >
                              {project.name}
                            </span>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        
                        {task.timeEstimate && (
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiClock size={10} />
                              <span>{task.timeEstimate} {t('tasks.time.minutes')}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleEditTask(task)}
                      className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                    >
                      <FiEdit2 size={16} />
                    </button>
                  </div>
                )
              })}
              
              {selectedDayTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <FiCalendar size={40} className="text-blue-500" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {t('planning.empty')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('planning.clickToAdd')}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      <Modal
        isOpen={showTaskForm}
        onClose={handleCloseForm}
          size="xlarge"
        title={
          editingTask 
            ? t('tasks.form.editTitle')
            : selectedTimeSlot 
              ? selectedTimeSlot.hour !== null
                ? `${t('planning.taskFor')} ${getDayName(selectedTimeSlot.date)} - ${selectedTimeSlot.hour}:۰۰`
                : `${t('planning.taskFor')} ${getDayName(selectedTimeSlot.date)}`
              : t('tasks.form.createTitle')
        }
      >
        <TaskForm 
          onClose={handleCloseForm}
          editTask={editingTask}
          initialData={selectedTimeSlot && !editingTask ? {
            dueDate: getLocalDateStr(selectedTimeSlot.date),
            dueTime: selectedTimeSlot.hour
          } : {}}
        />
      </Modal>

      {hoveredTask && (
        <TaskTooltip
          task={hoveredTask}
          project={projectsById.get(hoveredTask.projectId)}
          position={tooltipPos}
          t={t}
        />
      )}
    </div>
  )
}

export default memo(PlanningPage)