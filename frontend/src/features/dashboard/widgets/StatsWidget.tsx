import React from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiFolder, FiCheckSquare, FiClock, FiTrendingUp } from 'react-icons/fi'
import { formatTimeByLang } from '../../../utils/formatters'
import type { RootState } from '../../../app/store'

const StatsWidget: React.FC = () => {
  const { t } = useTranslation()
  const { projects = [] } = useSelector((s: RootState) => s.projects)
  const { tasks = [] } = useSelector((s: RootState) => s.tasks)

  const completedTasks = tasks.filter((x) => x.completed).length
  const totalTimeActual = tasks.reduce((sum, x) => sum + (x.actualTime || 0), 0)
  const totalTimeEstimated = tasks.reduce((sum, x) => sum + (x.timeEstimate || 0), 0)
  const timeEfficiency = totalTimeEstimated > 0
    ? Math.min(Math.round((totalTimeActual / totalTimeEstimated) * 100), 100) : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="text-center p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="w-8 h-8 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-1.5">
          <FiFolder size={16} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{projects.length}</div>
        <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{t('nav.projects')}</div>
      </div>
      <div className="text-center p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <div className="w-8 h-8 mx-auto bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mb-1.5">
          <FiCheckSquare size={16} className="text-green-600 dark:text-green-400" />
        </div>
        <div className="text-xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
        <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{t('settings.data.completed')} {t('achievements.of')} {tasks.length}</div>
      </div>
      <div className="text-center p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <div className="w-8 h-8 mx-auto bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center mb-1.5">
          <FiClock size={16} className="text-orange-600 dark:text-orange-400" />
        </div>
        <div className="text-base font-bold text-orange-600 dark:text-orange-400">{formatTimeByLang(totalTimeActual)}</div>
        <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{t('analytics.cards.effectiveTime')}</div>
      </div>
      <div className="text-center p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <div className="w-8 h-8 mx-auto bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mb-1.5">
          <FiTrendingUp size={16} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{timeEfficiency}%</div>
        <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{t('analytics.cards.productivity')}</div>
      </div>
    </div>
  )
}

export default StatsWidget