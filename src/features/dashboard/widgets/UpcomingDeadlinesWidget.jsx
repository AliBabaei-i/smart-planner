import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiClock, FiCalendar, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { formatShortDateByLang } from '../../../utils/formatters'

const UpcomingDeadlinesWidget = () => {
  const { t } = useTranslation()
  const { tasks = [] } = useSelector(state => state.tasks)

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const nextWeek = new Date(now)
  nextWeek.setDate(now.getDate() + 7)

  const upcomingTasks = tasks
    .filter(t => {
      if (t.completed || !t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate >= now && dueDate <= nextWeek
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  const getDaysUntil = (dateStr) => {
    const dueDate = new Date(dateStr)
    dueDate.setHours(0, 0, 0, 0)
    const diffTime = dueDate - now
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (days === 0) return { text: t('time.today'), color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' }
    if (days === 1) return { text: t('time.tomorrow'), color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' }
    if (days <= 3) return { text: `${days} ${t('time.days')}`, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' }
    return { text: `${days} ${t('time.days')}`, color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50' }
  }

  if (upcomingTasks.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
          <FiCheckCircle size={28} className="text-green-500" />
        </div>
        <p className="text-sm font-medium">{t('tasks.noResults')}</p>
        <p className="text-xs mt-1">{t('analytics.labels.excellent')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {upcomingTasks.map(task => {
        const daysUntil = getDaysUntil(task.dueDate)
        return (
          <div 
            key={task.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FiClock className="text-gray-400 flex-shrink-0" size={14} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {task.title}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {formatShortDateByLang(task.dueDate)}
                </div>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ms-2 ${daysUntil.color}`}>
              {daysUntil.text}
            </span>
          </div>
        )
      })}
      {upcomingTasks.length === 5 && (
        <Link 
          to="/tasks"
          className="text-center text-xs text-blue-600 dark:text-blue-400 hover:underline block pt-2"
        >
          {t('search.navigateTo')} →
        </Link>
      )}
    </div>
  )
}

export default UpcomingDeadlinesWidget