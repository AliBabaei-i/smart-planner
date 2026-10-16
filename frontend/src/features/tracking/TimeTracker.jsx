import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiPlay, FiPause, FiSquare, FiRefreshCw, FiClock, FiCheckCircle } from 'react-icons/fi'
import { updateTask } from '../tasks/tasksSlice'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { formatTimeByLang } from '../../utils/formatters'

const TimeTracker = ({ taskId, onClose }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { tasks = [] } = useSelector(state => state.tasks)
  const task = tasks.find(t => t.id === taskId)
  
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    let interval = null
    
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isRunning, startTime])

  const startTimer = () => {
    setIsRunning(true)
    setStartTime(Date.now() - elapsedTime)
  }

  const pauseTimer = () => setIsRunning(false)

  const stopTimer = () => {
    setIsRunning(false)
    const totalMinutes = Math.floor((elapsedTime + (startTime ? Date.now() - startTime : 0)) / 60000)
    
    if (task && totalMinutes > 0) {
      dispatch(updateTask({
        id: taskId,
        actualTime: (task.actualTime || 0) + totalMinutes
      }))
    }
    
    setElapsedTime(0)
    setStartTime(null)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setElapsedTime(0)
    setStartTime(null)
  }

  const formatTimer = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  if (!task) {
    return (
      <Card className="p-6 text-center">
        <p>{t('tasks.empty')}</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <FiClock className="text-blue-600" />
          <span>{t('pomodoro.title')}</span>
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm truncate">{task.title}</p>
      </div>

      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
          {formatTimer(elapsedTime)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatTimeByLang(task.actualTime || 0)}
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {!isRunning ? (
          <Button onClick={startTimer} variant="primary">
            <FiPlay size={16} />
            <span>{t('pomodoro.start')}</span>
          </Button>
        ) : (
          <Button onClick={pauseTimer} variant="secondary">
            <FiPause size={16} />
            <span>{t('pomodoro.pause')}</span>
          </Button>
        )}
        
        <Button onClick={stopTimer} variant="danger">
          <FiSquare size={14} />
          <span>{t('actions.confirm')}</span>
        </Button>
        
        <Button onClick={resetTimer} variant="secondary">
          <FiRefreshCw size={14} />
          <span>{t('actions.reset')}</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('tasks.form.timeEstimate')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {formatTimeByLang(task.timeEstimate || 0)}
          </div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('tasks.details.actualTime')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {formatTimeByLang(task.actualTime || 0)}
          </div>
        </div>
      </div>

      {onClose && (
        <div className="mt-4 text-center">
          <Button onClick={onClose} variant="secondary">
            {t('actions.close')}
          </Button>
        </div>
      )}
    </Card>
  )
}

export default TimeTracker