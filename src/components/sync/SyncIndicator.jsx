import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  FiCloud, FiCloudOff, FiRefreshCw, FiCheck,
  FiAlertCircle, FiWifiOff
} from 'react-icons/fi'
import {
  selectSyncStatus,
  selectLastSync,
  selectQueueSize
} from '../../features/sync/syncSlice'
import { syncService } from '../../services/syncService'
import { formatRelativeTimeByLang } from '../../utils/formatters'

const SyncIndicator = () => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const status = useSelector(selectSyncStatus)
  const lastSyncAt = useSelector(selectLastSync)
  const queueSize = useSelector(selectQueueSize)

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleManualSync = useCallback(async () => {
    await syncService.forceSync()
  }, [])

  // ✅ آیکون بر اساس وضعیت
  const getIcon = () => {
    if (!isOnline) return <FiWifiOff size={14} className="text-amber-500" />
    if (status === 'syncing') return <FiRefreshCw size={14} className="text-blue-500 animate-spin" />
    if (status === 'error') return <FiAlertCircle size={14} className="text-red-500" />
    if (status === 'synced') return <FiCheck size={14} className="text-green-500" />
    return <FiCloud size={14} className="text-gray-400" />
  }

  // ✅ متن بر اساس وضعیت
  const getText = () => {
    if (!isOnline) return isPersian ? 'آفلاین' : 'Offline'
    if (status === 'syncing') return isPersian ? 'در حال sync...' : 'Syncing...'
    if (status === 'error') return isPersian ? 'خطای sync' : 'Sync error'
    if (status === 'synced') return isPersian ? 'sync شد' : 'Synced'
    return isPersian ? 'آنلاین' : 'Online'
  }

  // ✅ رنگ بر اساس وضعیت
  const getColor = () => {
    if (!isOnline) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30'
    if (status === 'syncing') return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
    if (status === 'error') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
    if (status === 'synced') return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
    return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(prev => !prev)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
          transition-all hover:shadow-md
          ${getColor()}
        `}
        title={getText()}
      >
        {getIcon()}
        <span className="hidden sm:inline">{getText()}</span>
        {queueSize > 0 && (
          <span className="bg-white/50 dark:bg-black/30 px-1.5 rounded-full text-[10px]">
            {queueSize}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowDetails(false)}
          />
          <div className="absolute top-full end-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 p-3 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {isPersian ? 'وضعیت Sync' : 'Sync Status'}
              </span>
              <button
                onClick={handleManualSync}
                disabled={status === 'syncing' || !isOnline}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPersian ? 'sync دستی' : 'Sync now'}
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isPersian ? 'اتصال:' : 'Connection:'}
                </span>
                <span className={isOnline ? 'text-green-600' : 'text-amber-600'}>
                  {isOnline ? (isPersian ? 'آنلاین' : 'Online') : (isPersian ? 'آفلاین' : 'Offline')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isPersian ? 'وضعیت:' : 'Status:'}
                </span>
                <span>{getText()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isPersian ? 'تغییرات در صف:' : 'Queued:'}
                </span>
                <span>{queueSize}</span>
              </div>

              {lastSyncAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    {isPersian ? 'آخرین sync:' : 'Last sync:'}
                  </span>
                  <span>{formatRelativeTimeByLang(lastSyncAt)}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SyncIndicator