import React from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { FiTrendingUp } from 'react-icons/fi'
import { getPersianDayName } from '../../../utils/persianDate'

const ProductivityWidget = () => {
  const { t, i18n } = useTranslation()
  const { tasks = [] } = useSelector(state => state.tasks)
  const isRTL = i18n.language === 'fa'

  const getDayName = (date) => {
    if (isRTL) {
      return getPersianDayName(date)
    }
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[date.getDay()]
  }

  const getData = () => {
    const now = new Date()
    const data = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dayName = getDayName(date)
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.updatedAt || task.createdAt)
        return taskDate.toDateString() === date.toDateString()
      })

      const completed = dayTasks.filter(t => t.completed).length
      const total = dayTasks.length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

      data.push({
        name: dayName,
        percentage,
        completed,
        total
      })
    }

    return data
  }

  const data = getData()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {payload[0].value}% {t('analytics.cards.productivity')}
          </p>
        </div>
      )
    }
    return null
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
          <FiTrendingUp size={28} className="text-blue-400" />
        </div>
        <p className="text-sm">{t('analytics.subtitle')}</p>
      </div>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="percentage" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ProductivityWidget