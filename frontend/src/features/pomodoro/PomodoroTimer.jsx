import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiTarget, FiCoffee, FiSun, FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi'
import {
  toggleTimer,
  resetTimer,
  tick,
  completeWork,
  completeBreak,
  setMode
} from './pomodoroSlice'
import { onPomodoroCompleted } from '../achievements/achievementsSlice'
import Button from '../../components/ui/Button'

const PomodoroTimer = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    settings,
    currentTaskId
  } = useSelector(state => state.pomodoro)
  const { tasks = [] } = useSelector(state => state.tasks)
  
  const intervalRef = useRef(null)
  const currentTask = tasks.find(t => t.id === currentTaskId)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => dispatch(tick()), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, dispatch])

  useEffect(() => {
    if (timeLeft === 0) {
      if (mode === 'work') {
        dispatch(completeWork())
        dispatch(onPomodoroCompleted())
        toast.success(t('notifications.pomodoroComplete'), {
          position: "bottom-left",
          autoClose: 6000,
        })
      } else {
        dispatch(completeBreak())
        toast.info(t('notifications.breakComplete'), {
          position: "bottom-left",
          autoClose: 6000,
        })
      }
    }
  }, [timeLeft, mode, dispatch, t])

  useEffect(() => {
    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [settings.notificationsEnabled])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    let totalTime
    if (mode === 'work') totalTime = settings.workDuration * 60
    else if (mode === 'shortBreak') totalTime = settings.shortBreakDuration * 60
    else totalTime = settings.longBreakDuration * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const getModeColor = () => {
    if (mode === 'work') return '#ef4444'
    if (mode === 'shortBreak') return '#10b981'
    return '#3b82f6'
  }

  const getModeIcon = () => {
    if (mode === 'work') return FiTarget
    if (mode === 'shortBreak') return FiCoffee
    return FiSun
  }

  const getModeLabel = () => {
    if (mode === 'work') return t('pomodoro.focus')
    if (mode === 'shortBreak') return t('pomodoro.shortBreak')
    return t('pomodoro.longBreak')
  }

  const progress = getProgress()
  const circumference = 2 * Math.PI * 90
  const offset = circumference - (progress / 100) * circumference
  const ModeIcon = getModeIcon()

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="mb-4 text-center">
        <div className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <ModeIcon size={20} style={{ color: getModeColor() }} />
          <span>{getModeLabel()}</span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('pomodoro.session')} {completedPomodoros}
        </div>
      </div>

      <div className="relative w-52 h-52 mb-6">
        <svg className="transform -rotate-90 w-52 h-52">
          <circle cx="104" cy="104" r="90" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-gray-700" />
          <circle
            cx="104" cy="104" r="90"
            stroke={getModeColor()}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold font-mono text-gray-900 dark:text-white">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {currentTask && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg w-full max-w-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('pomodoro.workingOn')}:</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {currentTask.title}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Button onClick={() => dispatch(toggleTimer())} variant="primary" className="px-8">
          {isRunning ? (
            <>
              <FiPause size={16} />
              <span>{t('pomodoro.pause')}</span>
            </>
          ) : (
            <>
              <FiPlay size={16} />
              <span>{t('pomodoro.start')}</span>
            </>
          )}
        </Button>
        <Button onClick={() => dispatch(resetTimer())} variant="secondary">
          <FiRefreshCw size={14} />
          <span>{t('pomodoro.reset')}</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => dispatch(setMode('work'))}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            mode === 'work' 
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <FiTarget size={12} />
          <span>{t('pomodoro.work')}</span>
        </button>
        <button
          onClick={() => dispatch(setMode('shortBreak'))}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            mode === 'shortBreak' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <FiCoffee size={12} />
          <span>{t('pomodoro.short')}</span>
        </button>
        <button
          onClick={() => dispatch(setMode('longBreak'))}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
            mode === 'longBreak' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <FiSun size={12} />
          <span>{t('pomodoro.long')}</span>
        </button>
      </div>
    </div>
  )
}

export default PomodoroTimer