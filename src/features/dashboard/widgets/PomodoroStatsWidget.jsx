import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiCoffee, FiPlay, FiArrowLeft, FiTarget, FiSun } from 'react-icons/fi'

const PomodoroStatsWidget = () => {
  const { t } = useTranslation()
  const { stats, isRunning, mode, timeLeft } = useSelector(state => state.pomodoro || {})

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getModeIcon = () => {
    if (mode === 'work') return FiTarget
    if (mode === 'shortBreak') return FiCoffee
    return FiSun
  }

  const getModeColor = () => {
    if (mode === 'work') return 'text-red-600 dark:text-red-400'
    if (mode === 'shortBreak') return 'text-green-600 dark:text-green-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  const ModeIcon = getModeIcon()

  return (
    <div className="space-y-3">
      {isRunning && (
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-center space-x-2 space-x-reverse text-xs text-gray-500 dark:text-gray-400 mb-1">
            <ModeIcon size={14} className={getModeColor()} />
            <span>{mode === 'work' ? t('pomodoro.focus') : mode === 'shortBreak' ? t('pomodoro.shortBreak') : t('pomodoro.longBreak')}</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${getModeColor()}`}>
            {formatTime(timeLeft || 0)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-xl font-bold text-red-600 dark:text-red-400">
            {stats?.today?.completed || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('time.today')}</div>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {stats?.today?.totalMinutes || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('time.minutes')}</div>
        </div>
      </div>

      <Link 
        to="/settings"
        className="flex items-center justify-center space-x-1 space-x-reverse text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        <span>{t('pomodoro.title')} - {t('nav.settings')}</span>
        <FiArrowLeft size={12} />
      </Link>
    </div>
  )
}

export default PomodoroStatsWidget