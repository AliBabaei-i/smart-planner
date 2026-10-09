import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiWifiOff } from 'react-icons/fi'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import Card from '../ui/Card'

const OfflineIndicator = () => {
  const { t } = useTranslation()
  const { isOnline } = useNetworkStatus()

  if (isOnline) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 start-4 end-4 md:start-auto md:end-4 md:w-80 z-50">
      <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiWifiOff size={20} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">
              {t('status.offline')}
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-300 mt-0.5">
              {t('status.offlineDesc')}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default OfflineIndicator