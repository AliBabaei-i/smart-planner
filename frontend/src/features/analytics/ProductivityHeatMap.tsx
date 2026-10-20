import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiActivity } from 'react-icons/fi'
import Card from '../../components/ui/Card'
import { getLocalDateStr } from '../../utils/dateHelpers'

interface ProductivityHeatMapProps {
  tasks: any[]
}

const ProductivityHeatMap = ({ tasks = [] }: ProductivityHeatMapProps) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; completed: number } | null>(null)

  // ✅ محاسبه همه تسک‌ها (چه انجام شده چه نشده)
  const heatmapData = useMemo(() => {
    const data: Record<string, { count: number; completed: number }> = {}

    tasks.forEach(task => {
      const dateStr = task.dueDate || getLocalDateStr(task.createdAt || Date.now())
      if (!data[dateStr]) {
        data[dateStr] = { count: 0, completed: 0 }
      }
      data[dateStr].count += 1
      if (task.completed) {
        data[dateStr].completed += 1
      }
    })

    return data
  }, [tasks])

  // ✅ ساخت روزهای سال (۳۶۵ روز گذشته)
  const days = useMemo(() => {
    const result = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 364)
    const dayOfWeek = startDate.getDay()
    startDate.setDate(startDate.getDate() - dayOfWeek)

    for (let i = 0; i < 371; i++) {
      const current = new Date(startDate)
      current.setDate(startDate.getDate() + i)
      const dateStr = getLocalDateStr(current)
      const dayData = heatmapData[dateStr] || { count: 0, completed: 0 }
      
      result.push({
        date: dateStr,
        dateObj: current,
        count: dayData.count,
        completed: dayData.completed,
        isFuture: current > today,
      })
    }
    return result
  }, [heatmapData])

  // ✅ رنگ‌بندی: بر اساس تعداد کل تسک‌ها
  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-gray-700/50'
    if (count === 1) return 'bg-emerald-300 dark:bg-emerald-800'
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-600'
    if (count === 3) return 'bg-emerald-500 dark:bg-emerald-400'
    return 'bg-emerald-600 dark:bg-emerald-300' 
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FiActivity className="text-emerald-600 dark:text-emerald-400" size={20} />
          <span>{isPersian ? 'نقشه حرارتی فعالیت' : 'Activity Heatmap'}</span>
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span className="me-1">{isPersian ? 'کمتر' : 'Less'}</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
          <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-400" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-300" />
          <span className="ms-1">{isPersian ? 'بیشتر' : 'More'}</span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count, completed: day.completed })}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`
                    w-3 h-3 rounded-sm transition-all cursor-pointer
                    ${day.isFuture ? 'opacity-30' : 'hover:ring-2 ring-emerald-500 dark:ring-emerald-400'}
                    ${getColor(day.count)}
                  `}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {hoveredDay && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg text-sm border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-white font-mono" dir="ltr">
            {hoveredDay.date}
          </span>
          <div className="flex gap-4 text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {hoveredDay.count} {isPersian ? 'تسک' : 'tasks'}
            </span>
            {hoveredDay.completed > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {hoveredDay.completed} {isPersian ? 'انجام شده' : 'done'}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

export default ProductivityHeatMap