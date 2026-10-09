import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiTarget, FiCoffee, FiSun, FiX } from 'react-icons/fi'
import PomodoroTimer from './PomodoroTimer'

const PomodoroWidget = () => {
  const { t } = useTranslation()
  const { timeLeft, isRunning, mode } = useSelector(state => state.pomodoro || {})
  const [isOpen, setIsOpen] = useState(false)

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getColor = () => {
    if (mode === 'work') return 'bg-red-500 hover:bg-red-600'
    if (mode === 'shortBreak') return 'bg-green-500 hover:bg-green-600'
    return 'bg-blue-500 hover:bg-blue-600'
  }

  const getIcon = () => {
    if (mode === 'work') return FiTarget
    if (mode === 'shortBreak') return FiCoffee
    return FiSun
  }

  const IconComponent = getIcon()

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed z-40 
          bottom-20 md:bottom-4 
          left-4
          ${getColor()}
          text-white rounded-full shadow-lg 
          hover:shadow-xl transition-all
          flex items-center justify-center space-x-2 space-x-reverse
          px-3 py-2 md:px-4 md:py-3
          ${isRunning ? 'animate-pulse' : ''}
        `}
        title={t('pomodoro.title')}
      >
        <IconComponent size={18} />
        <span className="font-mono font-bold text-sm md:text-base">
          {formatTime(timeLeft || 0)}
        </span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[90] animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full relative animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
            >
              <FiX size={18} />
            </button>

            <PomodoroTimer />
          </div>
        </div>
      )}
    </>
  )
}

export default PomodoroWidget