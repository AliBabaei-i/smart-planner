import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { 
  FiBarChart2, 
  FiPieChart, 
  FiTrendingUp,
  FiFolder,
  FiClock
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import { 
  formatTimeByLang, 
  getDayNameByLang,
  formatShortDateByLang
} from '../../utils/formatters'
import { getPersianMonthFromDate } from '../../utils/persianDate'

const AdvancedCharts = ({ projects = [], tasks = [], timeRange = 'week' }) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'fa'

  // ✅ نام ماه بر اساس زبان
  const getMonthName = (date) => {
    if (isRTL) return getPersianMonthFromDate(date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[date.getMonth()]
  }

  // ✅ برچسب بازه
  const rangeLabels = {
    week: t('analytics.ranges.week'),
    month: t('analytics.ranges.month'),
    year: t('analytics.ranges.year')
  }

  // ✅ داده‌های بهره‌وری بر اساس بازه
  const getProductivityData = () => {
    const now = new Date()
    const data = []

    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(now.getDate() - i)
        const dayName = getDayNameByLang(date)
        
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.updatedAt || task.createdAt)
          return taskDate.toDateString() === date.toDateString()
        })

        const planned = dayTasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0)
        const actual = dayTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0)

        data.push({ 
          name: dayName, 
          planned, 
          actual,
          fullDate: date.toISOString()
        })
      }
    } else if (timeRange === 'month') {
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - (i * 7) - 6)
        weekStart.setHours(0, 0, 0, 0)
        
        const weekEnd = new Date(now)
        weekEnd.setDate(now.getDate() - (i * 7))
        weekEnd.setHours(23, 59, 59, 999)

        const weekTasks = tasks.filter(task => {
          const taskDate = new Date(task.updatedAt || task.createdAt)
          return taskDate >= weekStart && taskDate <= weekEnd
        })

        const planned = weekTasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0)
        const actual = weekTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0)

        data.push({ 
          name: `${t('planning.week')} ${4 - i}`, 
          planned, 
          actual 
        })
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now)
        monthDate.setDate(1)
        monthDate.setMonth(now.getMonth() - i)
        
        const monthTasks = tasks.filter(task => {
          const taskDate = new Date(task.updatedAt || task.createdAt)
          return taskDate.getMonth() === monthDate.getMonth() &&
                 taskDate.getFullYear() === monthDate.getFullYear()
        })

        const planned = monthTasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0)
        const actual = monthTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0)

        data.push({ 
          name: getMonthName(monthDate), 
          planned, 
          actual 
        })
      }
    }

    return data
  }

  const productivityData = getProductivityData()

  // ✅ توزیع زمان
  const getTimeDistributionData = () => {
    const projectTime = {}
    let totalTime = 0

    tasks.forEach(task => {
      if (!task.actualTime) return
      const project = projects.find(p => p.id === task.projectId)
      const projectName = project?.name || t('tasks.form.selectProject')
      
      if (!projectTime[projectName]) {
        projectTime[projectName] = {
          name: projectName,
          value: 0,
          color: project?.color || '#6b7280'
        }
      }
      projectTime[projectName].value += task.actualTime
      totalTime += task.actualTime
    })

    return Object.values(projectTime)
      .map(item => ({
        ...item,
        percentage: totalTime > 0 ? Math.round((item.value / totalTime) * 100) : 0
      }))
      .filter(item => item.value > 0)
  }

  const timeDistributionData = getTimeDistributionData()

  // ✅ پیشرفت پروژه‌ها
  const projectProgressData = projects
    .map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id)
      if (projectTasks.length === 0) return null

      const completedTasks = projectTasks.filter(task => task.completed).length
      
      return {
        name: project.name,
        completed: completedTasks,
        total: projectTasks.length,
        progress: Math.round((completedTasks / projectTasks.length) * 100),
        color: project.color
      }
    })
    .filter(Boolean)

  // ✅ Tooltip با ترجمه
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {formatTimeByLang(entry.value, t)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // ✅ Tooltip مخصوص PieChart
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
            {data.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {formatTimeByLang(data.value, t)} ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  // ✅ Tooltip مخصوص BarChart
  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">{label}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {t('projects.stats.progress')}: {payload[0].value}%
          </p>
        </div>
      )
    }
    return null
  }

  // ✅ اگر داده‌ای وجود ندارد
  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <FiBarChart2 size={40} className="text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('analytics.subtitle')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t('tasks.emptyDesc')}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* نمودار بهره‌وری */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
          <FiTrendingUp size={18} className="text-blue-600" />
          <span>{t('analytics.charts.weeklyProductivity')} - {rangeLabels[timeRange]}</span>
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                reversed={isRTL}
              />
              <YAxis 
                tickFormatter={(value) => `${Math.round(value / 60)}h`} 
                tick={{ fontSize: 11 }}
                orientation={isRTL ? 'right' : 'left'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="planned" 
                name={t('tasks.form.timeEstimate')}
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                name={t('analytics.cards.effectiveTime')}
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* توزیع زمان */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <FiPieChart size={18} className="text-purple-600" />
            <span>{t('analytics.charts.timeDistribution')}</span>
          </h3>
          <div className="h-80">
            {timeDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                    <FiClock size={28} className="text-purple-400" />
                  </div>
                  <p className="text-sm">{t('tasks.form.timeEstimate')}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* پیشرفت پروژه‌ها */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <FiBarChart2 size={18} className="text-green-600" />
            <span>{t('analytics.charts.projectProgress')}</span>
          </h3>
          <div className="h-80">
            {projectProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgressData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    reversed={isRTL}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 11 }}
                    orientation={isRTL ? 'right' : 'left'}
                  />
                  <Tooltip content={<BarTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="progress" 
                    name={t('projects.stats.progress')} 
                    radius={[4, 4, 0, 0]}
                  >
                    {projectProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                    <FiFolder size={28} className="text-green-400" />
                  </div>
                  <p className="text-sm">{t('projects.empty')}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdvancedCharts