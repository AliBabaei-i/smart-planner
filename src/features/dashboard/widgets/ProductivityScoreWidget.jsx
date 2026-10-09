import React from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiTarget,
  FiZap,
  FiClock,
  FiCheckCircle,
  FiActivity
} from 'react-icons/fi'
import { formatTimeByLang } from '../../../utils/formatters'

const ProductivityScoreWidget = () => {
  const { t } = useTranslation()
  const { tasks = [] } = useSelector(state => state.tasks)
  const { achievements } = useSelector(state => state.achievements || {})
  const { stats: pomodoroStats } = useSelector(state => state.pomodoro || {})

  // ✅ محاسبه نمره بهره‌وری امروز
  const calculateScore = () => {
    const today = new Date().toDateString()
    
    // ۱. کارهای انجام شده امروز (۰-۴۰ نمره)
    const todayTasks = tasks.filter(t => {
      const taskDate = new Date(t.updatedAt || t.createdAt)
      return taskDate.toDateString() === today
    })
    const completedToday = todayTasks.filter(t => t.completed).length
    const totalToday = todayTasks.length
    const completionScore = totalToday > 0 
      ? Math.min((completedToday / totalToday) * 40, 40)
      : 0

    // ۲. پومودورو امروز (۰-۲۵ نمره)
    const todayPomodoros = pomodoroStats?.today?.completed || 0
    const pomodoroScore = Math.min(todayPomodoros * 5, 25)

    // ۳. زمان تمرکز امروز (۰-۲۰ نمره)
    const todayMinutes = pomodoroStats?.today?.totalMinutes || 0
    const focusScore = Math.min((todayMinutes / 120) * 20, 20)

    // ۴. Streak (۰-۱۵ نمره)
    const streak = achievements?.currentStreak || 0
    const streakScore = Math.min(streak * 3, 15)

    const total = Math.round(completionScore + pomodoroScore + focusScore + streakScore)
    return {
      total: Math.min(total, 100),
      breakdown: {
        completion: Math.round(completionScore),
        pomodoro: Math.round(pomodoroScore),
        focus: Math.round(focusScore),
        streak: Math.round(streakScore)
      },
      stats: {
        completedToday,
        totalToday,
        todayPomodoros,
        todayMinutes,
        streak
      }
    }
  }

  const score = calculateScore()

  // ✅ رنگ و وضعیت بر اساس نمره
  const getScoreData = () => {
    if (score.total >= 80) return {
      color: 'text-green-600 dark:text-green-400',
      bg: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      label: t('productivityScore.excellent'),
      message: t('productivityScore.excellentMsg'),
      Icon: FiAward
    }
    if (score.total >= 60) return {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      label: t('productivityScore.good'),
      message: t('productivityScore.goodMsg'),
      Icon: FiTrendingUp
    }
    if (score.total >= 40) return {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'from-yellow-500 to-orange-500',
      bgLight: 'bg-yellow-50 dark:bg-yellow-900/20',
      label: t('productivityScore.okay'),
      message: t('productivityScore.okayMsg'),
      Icon: FiTarget
    }
    return {
      color: 'text-red-600 dark:text-red-400',
      bg: 'from-red-500 to-orange-500',
      bgLight: 'bg-red-50 dark:bg-red-900/20',
      label: t('productivityScore.needsWork'),
      message: t('productivityScore.needsWorkMsg'),
      Icon: FiTrendingDown
    }
  }

  const scoreData = getScoreData()
  const ScoreIcon = scoreData.Icon

  // ✅ Progress circle
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score.total / 100) * circumference

  return (
    <div className="space-y-4">
      {/* نمره اصلی */}
      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="transform -rotate-90 w-40 h-40">
            {/* پس‌زمینه */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#scoreGradient)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={score.total >= 60 ? '#10b981' : score.total >= 40 ? '#f59e0b' : '#ef4444'} />
                <stop offset="100%" stopColor={score.total >= 60 ? '#3b82f6' : score.total >= 40 ? '#f97316' : '#dc2626'} />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <ScoreIcon size={28} className={scoreData.color} />
            <div className={`text-4xl font-bold ${scoreData.color} mt-1`}>
              {score.total}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              / ۱۰۰
            </div>
          </div>
        </div>

        <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${scoreData.bgLight} ${scoreData.color}`}>
          {scoreData.label}
        </div>
      </div>

      {/* پیام تشویقی */}
      <div className={`p-3 rounded-lg text-center text-sm ${scoreData.bgLight} ${scoreData.color}`}>
        {scoreData.message}
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {t('productivityScore.breakdown')}
        </div>
        
        {/* کارها */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <FiCheckCircle size={12} className="text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {t('productivityScore.tasks')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(score.breakdown.completion / 40) * 100}%` }}
              ></div>
            </div>
            <span className="font-mono font-medium text-gray-700 dark:text-gray-300 w-8 text-end">
              {score.stats.completedToday}/{score.stats.totalToday}
            </span>
          </div>
        </div>

        {/* پومودورو */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <FiZap size={12} className="text-red-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {t('productivityScore.pomodoro')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-red-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(score.breakdown.pomodoro / 25) * 100}%` }}
              ></div>
            </div>
            <span className="font-mono font-medium text-gray-700 dark:text-gray-300 w-8 text-end">
              {score.stats.todayPomodoros}
            </span>
          </div>
        </div>

        {/* زمان تمرکز */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <FiClock size={12} className="text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {t('productivityScore.focus')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(score.breakdown.focus / 20) * 100}%` }}
              ></div>
            </div>
            <span className="font-mono font-medium text-gray-700 dark:text-gray-300 w-8 text-end">
              {score.stats.todayMinutes}m
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <FiActivity size={12} className="text-orange-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {t('productivityScore.streak')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-orange-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(score.breakdown.streak / 15) * 100}%` }}
              ></div>
            </div>
            <span className="font-mono font-medium text-gray-700 dark:text-gray-300 w-8 text-end">
              {score.stats.streak}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductivityScoreWidget