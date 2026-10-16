import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { 
  FiBell, 
  FiClock, 
  FiCalendar, 
  FiBarChart2, 
  FiVolume2, 
  FiGlobe,
  FiInfo
} from 'react-icons/fi'
import { updateNotificationSettings } from '../notifications/notificationsSlice'
import Card from '../../components/ui/Card'

const NotificationSettings = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { settings = {} } = useSelector(state => state.notifications)

  const handleSettingChange = (key, value) => {
    dispatch(updateNotificationSettings({ [key]: value }))
  }

  const settingOptions = [
    {
      key: 'taskReminders',
      labelKey: 'notifications.settings.taskReminders',
      descKey: 'notifications.settings.taskRemindersDesc',
      Icon: FiClock
    },
    {
      key: 'dueDateAlerts',
      labelKey: 'notifications.settings.dueDateAlerts',
      descKey: 'notifications.settings.dueDateAlertsDesc',
      Icon: FiCalendar
    },
    {
      key: 'productivityReports',
      labelKey: 'notifications.settings.productivityReports',
      descKey: 'notifications.settings.productivityReportsDesc',
      Icon: FiBarChart2
    },
    {
      key: 'soundEnabled',
      labelKey: 'notifications.settings.soundEnabled',
      descKey: 'notifications.settings.soundEnabledDesc',
      Icon: FiVolume2
    },
    {
      key: 'pushEnabled',
      labelKey: 'notifications.settings.pushEnabled',
      descKey: 'notifications.settings.pushEnabledDesc',
      Icon: FiGlobe
    }
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
        <FiBell size={20} className="text-blue-600" />
        <span>{t('notifications.settings.title')}</span>
      </h3>
      
      <div className="space-y-4">
        {settingOptions.map(setting => {
          const isEnabled = settings?.[setting.key] ?? true
          const IconComponent = setting.Icon
          
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
                  onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isEnabled ? 'peer-checked:bg-blue-600' : ''}`}></div>
              </label>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start space-x-2 space-x-reverse">
          <FiInfo size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            {t('notifications.settings.hint')}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default NotificationSettings