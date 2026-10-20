import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FiActivity } from 'react-icons/fi'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Card from '../../components/ui/Card'
import { formatNumber, formatCompact } from './currencyHelpers'
import { getLocalDateStr } from '../../utils/dateHelpers'
import { toJalaali } from 'jalaali-js'
import type { Transaction } from '../../types/finance'

const PERSIAN_MONTHS = ['فرو','ارد','خرد','تیر','مرد','شهر','مهر','آبا','آذر','دی','بهم','اسف']
const EN_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const getMonthsRange = (from: string, to: string) => {
  const start = new Date(from)
  const end = new Date(to)
  const months = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  const last = new Date(end.getFullYear(), end.getMonth(), 1)

  while (cur <= last) {
    months.push({ key: `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`, year: cur.getFullYear(), month: cur.getMonth() + 1 })
    cur.setMonth(cur.getMonth() + 1)
  }
  return months
}

const daysBetween = (from: string, to: string) => {
  const a = new Date(from)
  const b = new Date(to)
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

interface ReportTimelineChartProps {
  transactions?: Transaction[]
  filters: any
}

const ReportTimelineChart = memo(({ transactions = [], filters }: ReportTimelineChartProps) => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const groupBy = useMemo(() => {
    if (!filters?.from || !filters?.to) return 'day'
    const days = daysBetween(filters.from, filters.to)
    return days > 62 ? 'month' : 'day'
  }, [filters?.from, filters?.to])

  const chartData = useMemo(() => {
    if (!filters?.from || !filters?.to) return []

    if (groupBy === 'day') {
      const grouped: Record<string, { income: number; expense: number }> = {}
      for (const tx of transactions) {
        if (!grouped[tx.date]) grouped[tx.date] = { income: 0, expense: 0 }
        if (tx.type === 'income') grouped[tx.date].income += Number(tx.amount) || 0
        else if (tx.type === 'expense') grouped[tx.date].expense += Number(tx.amount) || 0
      }

      const start = new Date(filters.from)
      const end = new Date(filters.to)
      const days = []
      const cur = new Date(start)

      while (cur <= end) {
        const dateStr = getLocalDateStr(cur)
        const dayData = grouped[dateStr] || { income: 0, expense: 0 }
        let label
        if (isPersian) {
          const j = toJalaali(cur.getFullYear(), cur.getMonth() + 1, cur.getDate())
          label = `${j.jd} ${PERSIAN_MONTHS[j.jm - 1]}`
        } else {
          label = `${cur.getDate()} ${EN_MONTHS[cur.getMonth()]}`
        }
        days.push({ key: dateStr, label, income: dayData.income, expense: dayData.expense, net: dayData.income - dayData.expense })
        cur.setDate(cur.getDate() + 1)
      }
      return days
    }

    const months = getMonthsRange(filters.from, filters.to)
    const grouped: Record<string, { income: number; expense: number }> = {}

    for (const tx of transactions) {
      const key = tx.date.slice(0, 7)
      if (!grouped[key]) grouped[key] = { income: 0, expense: 0 }
      if (tx.type === 'income') grouped[key].income += Number(tx.amount) || 0
      else if (tx.type === 'expense') grouped[key].expense += Number(tx.amount) || 0
    }

    return months.map(m => {
      const monthData = grouped[m.key] || { income: 0, expense: 0 }
      const label = isPersian ? `${PERSIAN_MONTHS[m.month - 1]} ${m.year}` : `${EN_MONTHS[m.month - 1]} ${m.year}`
      return { key: m.key, label, income: monthData.income, expense: monthData.expense, net: monthData.income - monthData.expense }
    })
  }, [transactions, filters?.from, filters?.to, groupBy, isPersian])

  const isEmpty = chartData.length === 0 || chartData.every(d => d.income === 0 && d.expense === 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg text-xs" style={{ direction: isPersian ? 'rtl' : 'ltr' }}>
        <p className="font-semibold text-gray-900 dark:text-white mb-1.5">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="flex justify-between gap-3">
            <span>{entry.name}:</span>
            <span className="font-medium">{formatNumber(entry.value, isPersian)}</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FiActivity size={16} className="text-emerald-600 dark:text-emerald-400" />
          {t('finance.reports.timelineChart.title')}
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          {groupBy === 'day' ? t('finance.reports.timelineChart.daily') : t('finance.reports.timelineChart.monthly')}
        </span>
      </div>

      {isEmpty ? (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
            <FiActivity size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('finance.reports.timelineChart.empty')}</p>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} reversed={isPersian} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} orientation={isPersian ? 'right' : 'left'} tickFormatter={(v) => formatCompact(v, isPersian)} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => value === 'income' ? t('finance.reports.timelineChart.income') : t('finance.reports.timelineChart.expense')} />
              <Bar dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={30} />
              <Bar dataKey="expense" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={30} />
              <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
})

ReportTimelineChart.displayName = 'ReportTimelineChart'
export default ReportTimelineChart