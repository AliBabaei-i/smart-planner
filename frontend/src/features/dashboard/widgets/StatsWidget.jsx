import React from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiFolder, FiCheckSquare, FiClock, FiTrendingUp } from 'react-icons/fi'
import { formatTimeByLang } from '../../../utils/formatters'

const StatsWidget = () => {
  const { t } = useTranslation()
  const { projects = [] } = useSelector(state => state.projects)
  const { tasks = [] } = useSelector(state => state.tasks)

  const completedTasks = tasks.filter(t => t.completed).length
  const totalTimeActual = tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0)
  const totalTimeEstimated = tasks.reduce((sum, task) => sum + (task.timeEstimate || 0), 0)
  const timeEfficiency = totalTimeEstimated > 0 
    ? Math.min(Math.round((totalTimeActual / totalTimeEstimated) * 100), 100) 
    : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-2">
          <FiFolder size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{projects.length}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('nav.projects')}</div>
      </div>
      
      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mb-2">
          <FiCheckSquare size={20} className="text-green-600 dark:text-green-400" />
        </div>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {t('settings.data.completed')} {t('achievements.of')} {tasks.length}
        </div>
      </div>
      
      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <div className="w-10 h-10 mx-auto bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center mb-2">
          <FiClock size={20} className="text-orange-600 dark:text-orange-400" />
        </div>
        <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
          {formatTimeByLang(totalTimeActual, t)}  {/* ✅ آپدیت شد */}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {t('analytics.cards.effectiveTime')}
        </div>
      </div>
      
      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <div className="w-10 h-10 mx-auto bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mb-2">
          <FiTrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{timeEfficiency}%</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('analytics.cards.productivity')}</div>
      </div>
    </div>
  )
}

export default StatsWidget