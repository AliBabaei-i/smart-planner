import React, { useState, useMemo, useCallback, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  FiBarChart2, FiTrendingUp, FiZap, FiTarget,
  FiClock, FiCheckCircle, FiAward, FiDownload
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AdvancedCharts from './AdvancedCharts'
import ExportPanel from './ExportPanel'
import { formatTimeByLang } from '../../utils/formatters'

const RANGES = ['week', 'month', 'year']

const AnalyticsPage = memo(() => {
  const { t } = useTranslation()
  const { projects = [] } = useSelector(state => state.projects)
  const { tasks = [] } = useSelector(state => state.tasks)
  const [timeRange, setTimeRange] = useState('week')
  const [activeTab, setActiveTab] = useState('analytics')

  // ✅ useMemo: فیلتر بر اساس بازه
  const filteredTasks = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        cutoffDate.setDate(now.getDate() - 7)
    }

    return tasks.filter(task => new Date(task.createdAt) >= cutoffDate)
  }, [tasks, timeRange])

  // ✅ useMemo: تمام محاسبات آماری
  const stats = useMemo(() => {
    const completed = filteredTasks.filter(task => task.completed).length
    const total = filteredTasks.length
    const pending = total - completed
    const totalTimeEstimated = filteredTasks.reduce((sum, task) => sum + (task.timeEstimate || 0), 0)
    const totalTimeActual = filteredTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0)
    const timeEfficiency = totalTimeEstimated > 0 
      ? Math.min(Math.round((totalTimeActual / totalTimeEstimated) * 100), 100) 
      : 0
    const highPriority = filteredTasks.filter(task => task.priority === 'high' && !task.completed).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const averageTime = total > 0 ? Math.round(totalTimeActual / total) : 0

    return {
      completed, total, pending, totalTimeEstimated, totalTimeActual,
      timeEfficiency, highPriority, completionRate, averageTime
    }
  }, [filteredTasks])

  // ✅ useMemo: پروژه‌های فعال
  const activeProjects = useMemo(() => {
    const activeIds = new Set(filteredTasks.map(t => t.projectId))
    return projects.filter(p => activeIds.has(p.id))
  }, [projects, filteredTasks])

  const handleTabAnalytics = useCallback(() => setActiveTab('analytics'), [])
  const handleTabExport = useCallback(() => setActiveTab('export'), [])
  const handleRangeChange = useCallback((range) => setTimeRange(range), [])

  return (
    <div className="space-y-6" id="analytics-content">
      {/* هدر */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <FiBarChart2 className="text-blue-600" />
            <span>{t('analytics.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('analytics.subtitle')}
          </p>
        </div>
        
        <div className="flex space-x-2 space-x-reverse">
          <Button variant={activeTab === 'analytics' ? 'primary' : 'secondary'} onClick={handleTabAnalytics}>
            <FiBarChart2 size={16} />
            <span>{t('analytics.tabs.analytics')}</span>
          </Button>
          <Button variant={activeTab === 'export' ? 'primary' : 'secondary'} onClick={handleTabExport}>
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
                <Button
                  key={range}
                  variant={timeRange === range ? 'primary' : 'secondary'}
                  onClick={() => handleRangeChange(range)}
                  size="small"
                >
                  {t(`analytics.ranges.${range}`)}
                </Button>
              ))}
            </div>
          </Card>

          {/* کارت‌های آماری */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mb-3">
                <FiTrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('analytics.cards.productivity')}
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {stats.timeEfficiency}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.timeEfficiency >= 80 ? t('analytics.labels.excellent') 
                  : stats.timeEfficiency >= 60 ? t('analytics.labels.good') 
                  : t('analytics.labels.needsImprovement')}
              </p>
            </Card>

            <Card className="p-5 text-center">
              <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mb-3">
                <FiZap size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('analytics.cards.completionRate')}
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                {stats.completionRate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.completed} {t('achievements.of')} {stats.total}
              </p>
            </Card>

            <Card className="p-5 text-center">
              <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center mb-3">
                <FiTarget size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('analytics.cards.urgentPriority')}
              </h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                {stats.highPriority}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('tasks.priority.high')}
              </p>
            </Card>

            <Card className="p-5 text-center">
              <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mb-3">
                <FiClock size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('analytics.cards.effectiveTime')}
              </h3>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {formatTimeByLang(stats.totalTimeActual, t)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('achievements.of')} {formatTimeByLang(stats.totalTimeEstimated, t)}
              </p>
            </Card>
          </div>

          <AdvancedCharts projects={projects} tasks={filteredTasks} timeRange={timeRange} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
                <FiCheckCircle size={18} className="text-blue-600" />
                <span>{t('analytics.labels.summary')}</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {t('analytics.cards.activeProjects')}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {activeProjects.length} {t('achievements.of')} {projects.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {t('analytics.cards.averageTime')}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {formatTimeByLang(stats.averageTime, t)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {t('analytics.cards.completionRate')}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {stats.completionRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {t('analytics.cards.pendingTasks')}
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400 text-sm">
                    {stats.pending}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
                <FiAward size={18} className="text-yellow-500" />
                <span>{t('analytics.labels.achievements')}</span>
              </h3>
              <div className="space-y-3">
                {stats.completed >= 10 && (
                  <div className="flex items-center space-x-3 space-x-reverse p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiCheckCircle size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {t('achievements.title')}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {stats.completed} {t('settings.data.completed')}
                      </div>
                    </div>
                  </div>
                )}
                {projects.length >= 3 && (
                  <div className="flex items-center space-x-3 space-x-reverse p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiBarChart2 size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {t('nav.projects')}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {projects.length} {t('nav.projects')}
                      </div>
                    </div>
                  </div>
                )}
                {stats.timeEfficiency >= 90 && (
                  <div className="flex items-center space-x-3 space-x-reverse p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiZap size={20} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {t('analytics.labels.excellent')}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {stats.timeEfficiency}%
                      </div>
                    </div>
                  </div>
                )}
                {stats.completed === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                      <FiAward size={28} className="text-gray-400" />
                    </div>
                    <p className="text-sm">{t('tasks.empty')}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <ExportPanel />
      )}
    </div>
  )
})
AnalyticsPage.displayName = 'AnalyticsPage'

export default AnalyticsPage