import React, { useState } from 'react'
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
  FiCircle
} from 'react-icons/fi'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import TaskForm from '../tasks/TaskForm'
import { 
  getPersianDayName, 
  getPersianWeekDates, 
  getPersianWeekRange,
  formatPersianDate,
  formatLongPersianDate,
  isTodayPersian,
  addDaysToPersianDate,
  getPersianDayNumber
} from '../../utils/persianDate'
import { formatDateByLang, formatLongDateByLang, getDayNameByLang } from '../../utils/formatters'

const PlanningPage = () => {
  const { t, i18n } = useTranslation()
  const { tasks = [] } = useSelector(state => state.tasks)
  const { projects = [] } = useSelector(state => state.projects)
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [editingTask, setEditingTask] = useState(null)

  const isRTL = i18n.language === 'fa'

  // ✅ تاریخ‌های هفته (بر اساس زبان)
  const getWeekDates = () => {
    if (isRTL) {
      return getPersianWeekDates(currentWeek)
    }
    
    // انگلیسی - یکشنبه تا شنبه
    const dates = []
    const start = new Date(currentWeek)
    const day = start.getDay() // 0 = Sunday
    start.setDate(start.getDate() - day)
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      dates.push(d)
    }
    return dates
  }

  const weekDates = getWeekDates()

  // ✅ بازه هفته (بر اساس زبان)
  const getWeekRangeLabel = () => {
    if (isRTL) {
      const { startLong, endLong } = getPersianWeekRange(currentWeek)
      return `${startLong} - ${endLong}`
    }
    
    const start = weekDates[0]
    const end = weekDates[6]
    return `${formatDateByLang(start)} - ${formatDateByLang(end)}`
  }

  // ✅ نام روز (بر اساس زبان)
  const getDayName = (date) => {
    if (isRTL) return getPersianDayName(date)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[date.getDay()]
  }

  // ✅ شماره روز (شمسی یا میلادی)
  const getDayNumber = (date) => {
    if (isRTL) return getPersianDayNumber(date)
    return date.getDate()
  }

  // ✅ چک کردن امروز
  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString()
  }

  // ✅ فرمت تاریخ کامل
  const formatDate = (date) => {
    if (isRTL) {
      return formatPersianDate(date)
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // ✅ فرمت تاریخ طولانی
  const formatLongDate = (date) => {
    if (isRTL) {
      return formatLongPersianDate(date)
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const timeSlots = []
  for (let hour = 5; hour <= 23; hour++) {
    timeSlots.push({
      hour,
      time: `${hour.toString().padStart(2, '0')}:00`,
      display: `${hour}:00`
    })
  }

  // ✅ ناوبری هفته
  const goToPreviousWeek = () => {
    if (isRTL) {
      setCurrentWeek(prev => addDaysToPersianDate(prev, -7))
    } else {
      const newWeek = new Date(currentWeek)
      newWeek.setDate(newWeek.getDate() - 7)
      setCurrentWeek(newWeek)
    }
  }

  const goToNextWeek = () => {
    if (isRTL) {
      setCurrentWeek(prev => addDaysToPersianDate(prev, 7))
    } else {
      const newWeek = new Date(currentWeek)
      newWeek.setDate(newWeek.getDate() + 7)
      setCurrentWeek(newWeek)
    }
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentWeek(today)
    setSelectedDate(today)
  }

  // ✅ کارهای یک تاریخ
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate).toDateString()
      const targetDate = new Date(date).toDateString()
      return taskDate === targetDate
    })
  }

  // ✅ کارهای یک بازه زمانی
  const getTasksForTimeSlot = (date, hour) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      
      const taskDate = new Date(task.dueDate).toDateString()
      const targetDate = new Date(date).toDateString()
      
      if (taskDate !== targetDate) return false
      
      if (task.dueTime !== null && task.dueTime !== undefined) {
        return parseInt(task.dueTime) === hour
      }
      
      return false
    })
  }

  const handleTimeSlotClick = (date, hour) => {
    setSelectedTimeSlot({ date, hour })
    setEditingTask(null)
    setShowTaskForm(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setSelectedTimeSlot(null)
    setShowTaskForm(true)
  }

  const handleCloseForm = () => {
    setShowTaskForm(false)
    setSelectedTimeSlot(null)
    setEditingTask(null)
  }

  const isSelected = (date) => {
    return new Date(date).toDateString() === new Date(selectedDate).toDateString()
  }

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <FiCalendar className="text-blue-600" />
            <span>{t('planning.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {getWeekRangeLabel()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={goToToday}>
            <FiCalendar size={16} />
            <span>{t('actions.today')}</span>
          </Button>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={goToPreviousWeek}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              title={t('actions.previous')}
            >
              {isRTL ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
            </button>
            <button
              onClick={goToNextWeek}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 border-x border-gray-300 dark:border-gray-600"
              title={t('actions.next')}
            >
              {isRTL ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
            </button>
          </div>
          <Button onClick={() => {
            setEditingTask(null)
            setSelectedTimeSlot(null)
            setShowTaskForm(true)
          }}>
            <FiPlus size={16} />
            <span>{t('tasks.new')}</span>
          </Button>
        </div>
      </div>

      {/* جدول هفتگی */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr>
                <th className="w-20 p-2 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1 space-x-reverse">
                    <FiClock size={12} />
                    <span>{t('planning.hour')}</span>
                  </span>
                </th>
                {weekDates.map((date, index) => (
                  <th 
                    key={index}
                    className={`p-3 border-l border-gray-200 dark:border-gray-700 text-center cursor-pointer transition-colors min-w-[110px] ${
                      isToday(date) ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800'
                    } ${isSelected(date) ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="space-y-1">
                      <div className={`text-xs ${
                        isToday(date) ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {getDayName(date)}
                      </div>
                      <div className={`text-lg font-bold ${
                        isToday(date) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {getDayNumber(date)}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(date)}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot, timeIndex) => (
                <tr key={timeIndex} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-2 border-l border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 font-medium">
                    {timeSlot.display}
                  </td>
                  
                  {weekDates.map((date, dateIndex) => {
                    const tasksInSlot = getTasksForTimeSlot(date, timeSlot.hour)
                    const isCurrent = isToday(date) && new Date().getHours() === timeSlot.hour
                    const isSelectedCell = isSelected(date)
                    
                    return (
                      <td 
                        key={dateIndex}
                        className={`p-1 border-l border-gray-200 dark:border-gray-700 h-20 align-top cursor-pointer transition-all ${
                          isCurrent ? 'bg-green-50 dark:bg-green-900/20' : ''
                        } ${isSelectedCell ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                        onClick={() => handleTimeSlotClick(date, timeSlot.hour)}
                      >
                        <div className="h-full min-h-16 space-y-1 p-1">
                          {tasksInSlot.map((task, taskIndex) => {
                            const project = projects.find(p => p.id === task.projectId)
                            return (
                              <div
                                key={taskIndex}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditTask(task)
                                }}
                                className="text-xs p-1.5 rounded text-white truncate shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ 
                                  backgroundColor: project?.color || '#3b82f6',
                                  opacity: task.completed ? 0.5 : 1
                                }}
                                title={`${task.title} - ${project?.name || ''}`}
                              >
                                <div className={`font-medium truncate ${task.completed ? 'line-through' : ''}`}>
                                  {task.title}
                                </div>
                                {project && (
                                  <div className="text-[10px] opacity-90 truncate">{project.name}</div>
                                )}
                              </div>
                            )
                          })}
                          
                          {tasksInSlot.length === 0 && (
                            <div className="text-xs text-gray-300 dark:text-gray-600 text-center flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-full">
                              <FiPlus size={14} />
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* کارهای روز انتخاب شده */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <FiCalendar size={18} className="text-blue-600" />
            <span>{getDayName(selectedDate)} - {formatLongDate(selectedDate)}</span>
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {getTasksForDate(selectedDate).length} {t('planning.taskCount')}
          </span>
        </div>
        
        <div className="space-y-3">
          {getTasksForDate(selectedDate)
            .sort((a, b) => (a.dueTime || 0) - (b.dueTime || 0))
            .map(task => {
              const project = projects.find(p => p.id === task.projectId)
              
              return (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-0">
                    <div className="text-xs font-mono text-gray-500 dark:text-gray-400 min-w-[50px] text-center bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 flex items-center justify-center space-x-1 space-x-reverse">
                      <FiClock size={10} />
                      <span>
                        {task.dueTime !== null && task.dueTime !== undefined 
                          ? `${task.dueTime.toString().padStart(2, '0')}:۰۰` 
                          : '--:--'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleEditTask(task)}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <FiCheckCircle size={18} className="text-green-500" />
                      ) : (
                        <FiCircle size={18} className="text-gray-400 hover:text-blue-500" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 space-x-reverse mb-1 flex-wrap gap-2">
                        <span 
                          className={`font-semibold cursor-pointer hover:text-blue-600 ${
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
                            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
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
                      
                      <div className="flex items-center space-x-3 space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                        {task.timeEstimate && (
                          <span className="flex items-center space-x-1 space-x-reverse">
                            <FiClock size={10} />
                            <span>
                              {task.timeEstimate} {t('tasks.time.minutes')}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleEditTask(task)}
                    className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                    title={t('actions.edit')}
                  >
                    <FiEdit2 size={16} />
                  </button>
                </div>
              )
            })}
          
          {getTasksForDate(selectedDate).length === 0 && (
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

      {/* Modal */}
      <Modal
        isOpen={showTaskForm}
        onClose={handleCloseForm}
        title={
          editingTask 
            ? t('tasks.form.editTitle')
            : selectedTimeSlot 
              ? `${t('planning.taskFor')} ${selectedTimeSlot.hour}:۰۰` 
              : t('tasks.form.createTitle')
        }
      >
        <TaskForm 
          onClose={handleCloseForm}
          editTask={editingTask}
          initialData={selectedTimeSlot && !editingTask ? {
            dueDate: new Date(selectedTimeSlot.date).toISOString().split('T')[0],
            dueTime: selectedTimeSlot.hour
          } : {}}
        />
      </Modal>
    </div>
  )
}

export default PlanningPage