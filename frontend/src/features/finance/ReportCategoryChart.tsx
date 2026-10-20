import React, { memo, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPieChart } from 'react-icons/fi'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../../components/ui/Card'
import { formatCompact, formatNumber } from './currencyHelpers'
import type { Transaction, Categories } from '../../types/finance'

interface ReportCategoryChartProps {
  transactions?: Transaction[]
  categories?: Categories
}

const MAX_SLICES = 6
const OTHERS_COLOR = '#9ca3af'

const ReportCategoryChart = memo(({ transactions = [], categories = { income: [], expense: [] } }: ReportCategoryChartProps) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [mode, setMode] = useState<'income' | 'expense'>('expense')

  const handleModeChange = useCallback((newMode: 'income' | 'expense') => {
    setMode(newMode)
  }, [])

  const chartData = useMemo(() => {
    const filtered = transactions.filter(tx => tx.type === mode)

    const grouped: Record<string, number> = {}
    for (const tx of filtered) {
      const key = tx.category || 'other'
      grouped[key] = (grouped[key] || 0) + (Number(tx.amount) || 0)
    }

    const catList = categories[mode] || []

    const items = Object.entries(grouped)
      .map(([catId, value]) => {
        const cat = catList.find(c => c.id === catId)
        return {
          id: catId,
          name: cat?.name || catId,
          value,
          color: cat?.color || '#6b7280'
        }
      })
      .sort((a, b) => b.value - a.value)

    if (items.length > MAX_SLICES) {
      const top = items.slice(0, MAX_SLICES - 1)
      const rest = items.slice(MAX_SLICES - 1)
      const othersValue = rest.reduce((s, i) => s + i.value, 0)
      top.push({
        id: '_others',
        name: t('finance.reports.categoryChart.others'),
        value: othersValue,
        color: OTHERS_COLOR
      })
      return top
    }

    return items
  }, [transactions, categories, mode, t])

  const total = useMemo(() => chartData.reduce((s, c) => s + c.value, 0), [chartData])
  const isEmpty = chartData.length === 0

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FiPieChart size={16} className="text-emerald-600 dark:text-emerald-400" />
          {t('finance.reports.categoryChart.title')}
        </h3>

        <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-0.5">
          <button
            type="button"
            onClick={() => handleModeChange('expense')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'expense'
                ? 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('finance.reports.categoryChart.expense')}
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('income')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'income'
                ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('finance.reports.categoryChart.income')}
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
            <FiPieChart size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('finance.reports.categoryChart.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatNumber(Number(value), isPersian)}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  direction: isPersian ? 'rtl' : 'ltr'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 self-center">
            {chartData.map((cat, i) => {
              const percentage = total > 0 ? (cat.value / total) * 100 : 0
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">{cat.name}</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{percentage.toFixed(1)}%</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px] text-end">{formatCompact(cat.value, isPersian)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
})

ReportCategoryChart.displayName = 'ReportCategoryChart'
export default ReportCategoryChart