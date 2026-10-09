import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiClock, FiCheckCircle, FiFileText, FiArrowLeft } from 'react-icons/fi'
import { formatRelativeTime } from '../../../utils/dateHelpers'

const RecentTasksWidget = () => {
  const { t } = useTranslation()
  const { tasks = [] } = useSelector(state => state.tasks)
  const { projects = [] } = useSelector(state => state.projects)

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  if (recentTasks.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
          <FiFileText size={28} className="text-gray-400" />
        </div>
        <p className="text-sm">{t('tasks.empty')}</p>
        <Link 
          to="/tasks"
          className="inline-flex items-center space-x-1 space-x-reverse text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline mt-2"
        >
          <span>{t('tasks.createFirst')}</span>
          <FiArrowLeft size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {recentTasks.map(task => {
        const project = projects.find(p => p.id === task.projectId)
        return (
          <div 
            key={task.id}
            className="flex items-center space-x-3 space-x-reverse p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            {project && (
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              ></div>
            )}
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium truncate ${
                task.completed 
                  ? 'line-through text-gray-400 dark:text-gray-500' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {task.title}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-1 space-x-reverse">
                <FiClock size={10} />
                <span>{formatRelativeTime(task.createdAt)}</span>
              </div>
            </div>
            {task.completed && (
              <FiCheckCircle className="text-green-500 flex-shrink-0" size={16} />
            )}
          </div>
        )
      })}
      <Link 
        to="/tasks"
        className="text-center text-xs text-blue-600 dark:text-blue-400 hover:underline block pt-2"
      >
        {t('search.navigateTo')} →
      </Link>
    </div>
  )
}

export default RecentTasksWidget