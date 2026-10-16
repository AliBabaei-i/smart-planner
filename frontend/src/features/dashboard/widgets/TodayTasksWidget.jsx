import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  FiCalendar, 
  FiCheckCircle, 
  FiCircle, 
  FiArrowLeft 
} from 'react-icons/fi'

const TodayTasksWidget = () => {
  const { t } = useTranslation()
  const { tasks = [] } = useSelector(state => state.tasks)
  const { projects = [] } = useSelector(state => state.projects)

  const today = new Date().toDateString()
  const todayTasks = tasks.filter(t => 
    t.dueDate && new Date(t.dueDate).toDateString() === today
  ).sort((a, b) => (a.dueTime || 0) - (b.dueTime || 0))

  const completedToday = todayTasks.filter(t => t.completed).length

  if (todayTasks.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
          <FiCalendar size={28} className="text-blue-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
          {t('planning.empty')}
        </p>
        <Link 
          to="/planning"
          className="inline-flex items-center space-x-1 space-x-reverse text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
        >
          <span>{t('nav.planning')}</span>
          <FiArrowLeft size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {completedToday} {t('achievements.of')} {todayTasks.length} {t('settings.data.completed')}
        </span>
        <span className="font-medium text-gray-900 dark:text-white">
          {Math.round((completedToday / todayTasks.length) * 100)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-l from-green-500 to-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${(completedToday / todayTasks.length) * 100}%` }}
        ></div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {todayTasks.slice(0, 5).map(task => {
          const project = projects.find(p => p.id === task.projectId)
          return (
            <div 
              key={task.id}
              className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              {task.completed ? (
                <FiCheckCircle className="text-green-500 flex-shrink-0" size={16} />
              ) : (
                <FiCircle className="text-gray-400 flex-shrink-0" size={16} />
              )}
              {task.dueTime !== null && task.dueTime !== undefined && (
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 flex-shrink-0">
                  {task.dueTime.toString().padStart(2, '0')}:۰۰
                </span>
              )}
              <span className={`flex-1 text-sm truncate ${
                task.completed 
                  ? 'line-through text-gray-400 dark:text-gray-500' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {task.title}
              </span>
              {project && (
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                ></div>
              )}
            </div>
          )
        })}
        {todayTasks.length > 5 && (
          <Link 
            to="/tasks"
            className="text-center text-xs text-blue-600 dark:text-blue-400 hover:underline block pt-2"
          >
            + {todayTasks.length - 5} {t('tasks.more')}
          </Link>
        )}
      </div>
    </div>
  )
}

export default TodayTasksWidget