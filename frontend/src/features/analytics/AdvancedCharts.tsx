import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { FiBarChart2, FiPieChart, FiTrendingUp, FiFolder, FiClock } from 'react-icons/fi'
import Card from '../../components/ui/Card'
import { formatTimeByLang, getDayNameByLang } from '../../utils/formatters'
import { getPersianMonthFromDate } from '../../utils/persianDate'

interface AdvancedChartsProps {
  projects: any[]
  tasks: any[]
  timeRange: string
}

const AdvancedCharts = ({ projects = [], tasks = [], timeRange = 'week' }: AdvancedChartsProps) => {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language?.startsWith('fa')

  const getMonthName = (date: Date) => {
    if (isRTL) return getPersianMonthFromDate(date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[date.getMonth()]
  }

  const rangeLabels: Record<string, string> = {
    week: t('analytics.ranges.week'),
    month: t('analytics.ranges.month'),
    year: t('analytics.ranges.year')
  }

  const productivityData = React.useMemo(() => {
    const now = new Date()
    const data = []
    if (timeRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now); date.setDate(now.getDate() - i)
        const dayTasks = tasks.filter(task => new Date(task.updatedAt || task.createdAt || Date.now()).toDateString() === date.toDateString())
        data.push({ name: getDayNameByLang(date), planned: dayTasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0), actual: dayTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0) })
      }
    } else if (timeRange === 'month') {
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now); weekStart.setDate(now.getDate() - (i * 7) - 6); weekStart.setHours(0,0,0,0)
        const weekEnd = new Date(now); weekEnd.setDate(now.getDate() - (i * 7)); weekEnd.setHours(23,59,59,999)
        const weekTasks = tasks.filter(task => { const d = new Date(task.updatedAt || task.createdAt || Date.now()); return d >= weekStart && d <= weekEnd })
        data.push({ name: `${t('planning.week')} ${4 - i}`, planned: weekTasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0), actual: weekTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0) })
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now); monthDate.setDate(1); monthDate.setMonth(now.getMonth() - i)
        const monthTasks = tasks.filter(task => { const d = new Date(task.updatedAt || task.createdAt || Date.now()); return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear() })
        data.push({ name: getMonthName(monthDate), planned: monthTasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0), actual: monthTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0) })
      }
    }
    return data
  }, [tasks, timeRange])

  const timeDistributionData = React.useMemo(() => {
    const projectTime: Record<string, any> = {}
    let totalTime = 0
    tasks.forEach(task => {
      if (!task.actualTime) return
      const project = projects.find(p => p.id === task.projectId)
      const projectName = project?.name || t('tasks.form.selectProject')
      if (!projectTime[projectName]) projectTime[projectName] = { name: projectName, value: 0, color: project?.color || '#6b7280' }
      projectTime[projectName].value += task.actualTime
      totalTime += task.actualTime
    })
    return Object.values(projectTime).map((item: any) => ({ ...item, percentage: totalTime > 0 ? Math.round((item.value / totalTime) * 100) : 0 })).filter(item => item.value > 0)
  }, [tasks, projects, t])

  const projectProgressData = React.useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(task => task.projectId === project.id)
      if (projectTasks.length === 0) return null
      const completedTasks = projectTasks.filter(task => task.completed).length
      return { name: project.name, progress: Math.round((completedTasks / projectTasks.length) * 100), color: project.color }
    }).filter(Boolean)
  }, [projects, tasks])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {formatTimeByLang(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FiBarChart2 size={40} className="text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('analytics.subtitle')}</h3>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
          <FiTrendingUp size={18} className="text-blue-600" />
          <span>{t('analytics.charts.weeklyProductivity')} - {rangeLabels[timeRange]}</span>
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} reversed={isRTL} />
              <YAxis tickFormatter={(v) => `${Math.round(v / 60)}h`} tick={{ fontSize: 11 }} orientation={isRTL ? 'right' : 'left'} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="planned" name={t('tasks.form.timeEstimate')} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="actual" name={t('analytics.cards.effectiveTime')} stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <FiPieChart size={18} className="text-purple-600" />
            <span>{t('analytics.charts.timeDistribution')}</span>
          </h3>
          <div className="h-80">
            {timeDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={timeDistributionData} cx="50%" cy="50%" labelLine={false} label={({ name, percentage }: any) => `${name} ${percentage}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {timeDistributionData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500"><FiClock size={28} /></div>
            )}
          </div>
        </Card>

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
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} reversed={isRTL} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} orientation={isRTL ? 'right' : 'left'} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" name={t('projects.stats.progress')} radius={[4, 4, 0, 0]}>
                    {projectProgressData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500"><FiFolder size={28} /></div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdvancedCharts