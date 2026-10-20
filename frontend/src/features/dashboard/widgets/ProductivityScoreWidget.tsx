import React from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiTrendingUp, FiTrendingDown, FiAward, FiTarget, FiZap, FiClock, FiCheckCircle, FiActivity } from 'react-icons/fi'
import type { RootState } from '../../../app/store'

interface ScoreData {
  total: number
  breakdown: { completion: number; pomodoro: number; focus: number; streak: number }
  stats: { completedToday: number; totalToday: number; todayPomodoros: number; todayMinutes: number; streak: number }
}

const ProductivityScoreWidget: React.FC = () => {
  const { t } = useTranslation()
  const { tasks = [] } = useSelector((s: RootState) => s.tasks)
  const achievements = useSelector((s: RootState) => s.achievements) as any
  const pomodoro = useSelector((s: RootState) => s.pomodoro) as any

  const calculateScore = (): ScoreData => {
    const today = new Date().toDateString()
    const todayTasks = tasks.filter((x) => new Date(x.updatedAt || x.createdAt).toDateString() === today)
    const completedToday = todayTasks.filter((x) => x.completed).length
    const totalToday = todayTasks.length
    const completionScore = totalToday > 0 ? Math.min((completedToday / totalToday) * 40, 40) : 0
    const todayPomodoros = pomodoro?.stats?.today?.completed || 0
    const pomodoroScore = Math.min(todayPomodoros * 5, 25)
    const todayMinutes = pomodoro?.stats?.today?.totalMinutes || 0
    const focusScore = Math.min((todayMinutes / 120) * 20, 20)
    const streak = achievements?.currentStreak || 0
    const streakScore = Math.min(streak * 3, 15)
    const total = Math.min(Math.round(completionScore + pomodoroScore + focusScore + streakScore), 100)
    return {
      total,
      breakdown: { completion: Math.round(completionScore), pomodoro: Math.round(pomodoroScore), focus: Math.round(focusScore), streak: Math.round(streakScore) },
      stats: { completedToday, totalToday, todayPomodoros, todayMinutes, streak },
    }
  }

  const score = calculateScore()
  const getScoreData = () => {
    if (score.total >= 80) return { color: 'text-green-600 dark:text-green-400', bgLight: 'bg-green-50 dark:bg-green-900/20', label: t('productivityScore.excellent'), Icon: FiAward }
    if (score.total >= 60) return { color: 'text-blue-600 dark:text-blue-400', bgLight: 'bg-blue-50 dark:bg-blue-900/20', label: t('productivityScore.good'), Icon: FiTrendingUp }
    if (score.total >= 40) return { color: 'text-yellow-600 dark:text-yellow-400', bgLight: 'bg-yellow-50 dark:bg-yellow-900/20', label: t('productivityScore.okay'), Icon: FiTarget }
    return { color: 'text-red-600 dark:text-red-400', bgLight: 'bg-red-50 dark:bg-red-900/20', label: t('productivityScore.needsWork'), Icon: FiTrendingDown }
  }
  const data = getScoreData()
  const Icon = data.Icon
  const radius = 50, circumference = 2 * Math.PI * radius
  const offset = circumference - (score.total / 100) * circumference

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28">
          <svg className="transform -rotate-90 w-28 h-28">
            <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-700" />
            <circle cx="56" cy="56" r={radius} stroke="url(#sg)" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={score.total >= 60 ? '#10b981' : score.total >= 40 ? '#f59e0b' : '#ef4444'} />
              <stop offset="100%" stopColor={score.total >= 60 ? '#3b82f6' : score.total >= 40 ? '#f97316' : '#dc2626'} />
            </linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon size={18} className={data.color} />
            <div className={`text-2xl font-bold ${data.color}`}>{score.total}</div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400">/ 100</div>
          </div>
        </div>
        <div className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${data.bgLight} ${data.color}`}>{data.label}</div>
      </div>
      <div className="space-y-1.5">
        {[
          { Icon: FiCheckCircle, label: t('productivityScore.tasks'), value: score.breakdown.completion, max: 40, display: `${score.stats.completedToday}/${score.stats.totalToday}`, color: 'bg-green-500' },
          { Icon: FiZap, label: t('productivityScore.pomodoro'), value: score.breakdown.pomodoro, max: 25, display: score.stats.todayPomodoros, color: 'bg-red-500' },
          { Icon: FiClock, label: t('productivityScore.focus'), value: score.breakdown.focus, max: 20, display: `${score.stats.todayMinutes}m`, color: 'bg-blue-500' },
          { Icon: FiActivity, label: t('productivityScore.streak'), value: score.breakdown.streak, max: 15, display: score.stats.streak, color: 'bg-orange-500' },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1"><row.Icon size={10} className="text-gray-500" /><span className="text-gray-600 dark:text-gray-400">{row.label}</span></div>
            <div className="flex items-center gap-1.5">
              <div className="w-14 bg-gray-200 dark:bg-gray-700 rounded-full h-1"><div className={`${row.color} h-1 rounded-full`} style={{ width: `${(row.value / row.max) * 100}%` }} /></div>
              <span className="font-mono text-gray-700 dark:text-gray-300 w-10 text-end">{row.display}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductivityScoreWidget