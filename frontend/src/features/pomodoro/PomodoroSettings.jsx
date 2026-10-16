import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiCoffee,
  FiTarget,
  FiSun,
  FiRefreshCw,
  FiClock,
  FiSettings,
  FiPlay,
  FiPause,
  FiVolume2,
  FiBell,
  FiInfo,
  FiZap,
  FiRefreshCcw
} from 'react-icons/fi'
import { updateSettings, resetStats } from './pomodoroSlice'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const PomodoroSettings = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { settings, stats } = useSelector(state => state.pomodoro)
  const [resetConfirm, setResetConfirm] = useState(false)

  const handleChange = (key, value) => {
    const numValue = parseInt(value)
    if (isNaN(numValue) || numValue < 1) return
    
    dispatch(updateSettings({ [key]: numValue }))
  }

  const handleToggle = (key, value) => {
    dispatch(updateSettings({ [key]: value }))
  }

  const confirmResetStats = () => {
    dispatch(resetStats())
    toast.success(t('pomodoro.settings.resetStats'), {
      position: "bottom-left",
      autoClose: 3000,
    })
    setResetConfirm(false)
  }

  const durationSettings = [
    {
      key: 'workDuration',
      labelKey: 'pomodoro.settings.workDuration',
      descKey: 'pomodoro.settings.workDurationDefault',
      Icon: FiTarget,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      max: 120
    },
    {
      key: 'shortBreakDuration',
      labelKey: 'pomodoro.settings.shortBreakDuration',
      descKey: 'pomodoro.settings.shortBreakDefault',
      Icon: FiCoffee,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      max: 30
    },
    {
      key: 'longBreakDuration',
      labelKey: 'pomodoro.settings.longBreakDuration',
      descKey: 'pomodoro.settings.longBreakDefault',
      Icon: FiSun,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      max: 60
    },
    {
      key: 'longBreakInterval',
      labelKey: 'pomodoro.settings.longBreakInterval',
      descKey: 'pomodoro.settings.longBreakIntervalDesc',
      Icon: FiZap,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      max: 10
    }
  ]

  const advancedSettings = [
    {
      key: 'autoStartBreaks',
      labelKey: 'pomodoro.settings.autoStartBreaks',
      descKey: 'pomodoro.settings.autoStartBreaksDesc',
      Icon: FiRefreshCw
    },
    {
      key: 'autoStartPomodoros',
      labelKey: 'pomodoro.settings.autoStartPomodoros',
      descKey: 'pomodoro.settings.autoStartPomodorosDesc',
      Icon: FiPlay
    },
    {
      key: 'soundEnabled',
      labelKey: 'pomodoro.settings.soundEnabled',
      descKey: 'pomodoro.settings.soundEnabledDesc',
      Icon: FiVolume2
    },
    {
      key: 'notificationsEnabled',
      labelKey: 'pomodoro.settings.notificationsEnabled',
      descKey: 'pomodoro.settings.notificationsEnabledDesc',
      Icon: FiBell
    }
  ]

  return (
    <div className="space-y-6">
      {/* آمار */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
          <FiCoffee size={20} className="text-red-500" />
          <span>{t('pomodoro.settings.stats')}</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.today.completed}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('pomodoro.settings.today')}
            </div>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.today.totalMinutes}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('pomodoro.settings.todayMinutes')}
            </div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.allTime.completed}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('pomodoro.settings.allTime')}
            </div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(stats.allTime.totalMinutes / 60)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('pomodoro.settings.allTimeHours')}
            </div>
          </div>
        </div>

        <Button 
          onClick={() => setResetConfirm(true)}
          variant="secondary"
          size="small"
        >
          <FiRefreshCw size={14} />
          <span>{t('pomodoro.settings.resetStats')}</span>
        </Button>
      </Card>

      {/* مدت زمان‌ها */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
          <FiClock size={20} className="text-blue-600" />
          <span>{t('pomodoro.settings.durations')}</span>
        </h3>
        
        <div className="space-y-4">
          {durationSettings.map(setting => {
            const IconComponent = setting.Icon
            const unitKey = setting.key === 'longBreakInterval' 
              ? 'pomodoro.settings.pomodoros' 
              : 'pomodoro.settings.minutes'
            
            return (
              <div 
                key={setting.key} 
                className={`flex items-center justify-between p-4 rounded-lg ${setting.bg} flex-wrap gap-3`}
              >
                <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-[200px]">
                  <div className={`w-10 h-10 ${setting.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <IconComponent size={20} className={setting.color} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {t(setting.labelKey)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t(setting.descKey)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="number"
                    min="1"
                    max={setting.max}
                    value={settings[setting.key]}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    className="w-20 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {t(unitKey)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* تنظیمات پیشرفته */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
          <FiSettings size={20} className="text-blue-600" />
          <span>{t('pomodoro.settings.advanced')}</span>
        </h3>
        
        <div className="space-y-4">
          {advancedSettings.map(setting => {
            const IconComponent = setting.Icon
            const isEnabled = settings[setting.key]
            
            return (
              <div 
                key={setting.key} 
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {t(setting.labelKey)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t(setting.descKey)}
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => handleToggle(setting.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isEnabled ? 'peer-checked:bg-blue-600' : ''}`}></div>
                </label>
              </div>
            )
          })}
        </div>
      </Card>

      {/* راهنما */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-start space-x-3 space-x-reverse">
          <FiInfo size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong className="block mb-1">{t('pomodoro.settings.tip')}</strong>
            {t('pomodoro.settings.tipDesc')}
          </div>
        </div>
      </Card>

     <ConfirmDialog
  isOpen={resetConfirm}
  onClose={() => setResetConfirm(false)}
  onConfirm={confirmResetStats}
  title={t('pomodoro.settings.resetStats')}
  message={t('confirm.clearDataMessage')}
  confirmText={t('actions.confirm')}
  cancelText={t('actions.cancel')}
  variant="danger"
  Icon={FiRefreshCcw}
/>
    </div>
  )
}

export default PomodoroSettings