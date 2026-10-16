import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  FiPlus, 
  FiFolder, 
  FiCalendar, 
  FiBarChart2, 
  FiAward, 
  FiSettings 
} from 'react-icons/fi'

const QuickActionsWidget = () => {
  const { t } = useTranslation()

  const actions = [
    { icon: FiPlus, title: t('tasks.new'), path: '/tasks', color: 'from-blue-500 to-blue-600' },
    { icon: FiFolder, title: t('projects.new'), path: '/projects', color: 'from-green-500 to-green-600' },
    { icon: FiCalendar, title: t('nav.planning'), path: '/planning', color: 'from-purple-500 to-purple-600' },
    { icon: FiBarChart2, title: t('nav.analytics'), path: '/analytics', color: 'from-orange-500 to-orange-600' },
    { icon: FiAward, title: t('nav.achievements'), path: '/achievements', color: 'from-yellow-500 to-yellow-600' },
    { icon: FiSettings, title: t('nav.settings'), path: '/settings', color: 'from-gray-500 to-gray-600' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map(action => {
        const IconComponent = action.icon
        return (
          <Link
            key={action.path}
            to={action.path}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 text-center group"
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow`}>
              <IconComponent size={20} className="text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {action.title}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export default QuickActionsWidget