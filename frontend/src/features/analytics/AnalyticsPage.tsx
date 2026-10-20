import React, { useState, useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  FiBarChart2, FiTrendingUp, FiZap, FiTarget,
  FiClock, FiDownload
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AdvancedCharts from './AdvancedCharts'
import ExportPanel from './ExportPanel'
import { formatTimeByLang } from '../../utils/formatters'
import type { RootState } from '../../app/store'
import ProductivityHeatMap from './ProductivityHeatMap'
const RANGES = ['week', 'month', 'year'] as const
type TimeRange = typeof RANGES[number]

const AnalyticsPage = memo(() => {
  const { t } = useTranslation()
  const { projects = [] } = useSelector((state: RootState) => state.projects)
  const { tasks = [] } = useSelector((state: RootState) => state.tasks)
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [activeTab, setActiveTab] = useState<'analytics' | 'export'>('analytics')

  const filteredTasks = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date()
    switch (timeRange) {
      case 'week': cutoffDate.setDate(now.getDate() - 7); break
      case 'month': cutoffDate.setMonth(now.getMonth() - 1); break
      case 'year': cutoffDate.setFullYear(now.getFullYear() - 1); break
    }
    return tasks.filter(task => new Date(task.createdAt || Date.now()) >= cutoffDate)
  }, [tasks, timeRange])

  const stats = useMemo(() => {
    const completed = filteredTasks.filter(task => task.completed).length
    const total = filteredTasks.length
    const pending = total - completed
    const totalTimeEstimated = filteredTasks.reduce((sum, task) => sum + (task.timeEstimate || 0), 0)
    const totalTimeActual = filteredTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0)
    const timeEfficiency = totalTimeEstimated > 0
      ? Math.min(Math.round((totalTimeActual / totalTimeEstimated) * 100), 100) : 0
    const highPriority = filteredTasks.filter(task => task.priority === 'high' && !task.completed).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, pending, totalTimeEstimated, totalTimeActual, timeEfficiency, highPriority, completionRate }
  }, [filteredTasks])

  return (
    <div className="space-y-6" id="analytics-content">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <FiBarChart2 className="text-blue-600" />
            <span>{t('analytics.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('analytics.subtitle')}</p>
        </div>

        <div className="flex space-x-2 space-x-reverse">
          <Button variant={activeTab === 'analytics' ? 'primary' : 'secondary'} onClick={() => setActiveTab('analytics')}>
            <FiBarChart2 size={16} />
            <span>{t('analytics.tabs.analytics')}</span>
          </Button>
          <Button variant={activeTab === 'export' ? 'primary' : 'secondary'} onClick={() => setActiveTab('export')}>
            <FiDownload size={16} />
            <span>{t('analytics.tabs.export')}</span>
          </Button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <>
          <Card className="p-3">
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {RANGES.map(range => (
                <Button key={range} variant={timeRange === range ? 'primary' : 'secondary'} onClick={() => setTimeRange(range)} size="small">
                  {t(`analytics.ranges.${range}`)}
                </Button>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mb-3">
                <FiTrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('analytics.cards.productivity')}</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.timeEfficiency}%</p>
            </Card>

            <Card className="p-5 text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mb-3">
                <FiZap size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('analytics.cards.completionRate')}</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.completionRate}%</p>
            </Card>

            <Card className="p-5 text-center">
              <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center mb-3">
                <FiTarget size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('analytics.cards.urgentPriority')}</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.highPriority}</p>
            </Card>

            <Card className="p-5 text-center">
              <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mb-3">
                <FiClock size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('analytics.cards.effectiveTime')}</h3>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {formatTimeByLang(stats.totalTimeActual)}
              </p>
            </Card>
          </div>
          <ProductivityHeatMap tasks={tasks} />
          <AdvancedCharts projects={projects} tasks={filteredTasks} timeRange={timeRange} />
        </>
      ) : (
        <ExportPanel />
      )}
    </div>
  )
})
AnalyticsPage.displayName = 'AnalyticsPage'
export default AnalyticsPage