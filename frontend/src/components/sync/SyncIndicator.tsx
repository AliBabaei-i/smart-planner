import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import {
  FiCloud,
  FiCloudOff,
  FiRefreshCw,
  FiCheck,
  FiAlertCircle,
  FiWifiOff,
  FiZap,
  FiClock,
  FiDatabase,
} from 'react-icons/fi'
import {
  selectSyncStatus,
  selectLastSync,
  selectQueueSize,
} from '../../features/sync/syncSlice'
import { syncService } from '../../services/syncService'
import { formatRelativeTimeByLang } from '../../utils/formatters'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

const SyncIndicator: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const status = useSelector(selectSyncStatus) as SyncStatus | undefined
  const lastSyncAt = useSelector(selectLastSync) as string | null | undefined
  const queueSize = useSelector(selectQueueSize) as number | undefined

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [showDetails, setShowDetails] = useState(false)
  const [isFullSyncing, setIsFullSyncing] = useState(false)

  // ✅ Online/Offline listener
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

  // ✅ Handlers
  const handleManualSync = useCallback(async () => {
    if (status === 'syncing' || !isOnline) return
    await syncService.forceSync()
  }, [status, isOnline])

  const handleFullSync = useCallback(async () => {
    if (isFullSyncing || !isOnline) return
    setIsFullSyncing(true)
    try {
      await syncService.forceFullSync()
    } finally {
      setIsFullSyncing(false)
      setShowDetails(false)
    }
  }, [isFullSyncing, isOnline])

  // ✅ Icon
  const getIcon = () => {
    if (!isOnline) return <FiWifiOff size={14} className="text-amber-500" />
    if (status === 'syncing' || isFullSyncing)
      return <FiRefreshCw size={14} className="text-blue-500 animate-spin" />
    if (status === 'error')
      return <FiAlertCircle size={14} className="text-red-500" />
    if (status === 'synced')
      return <FiCheck size={14} className="text-green-500" />
    return <FiCloud size={14} className="text-gray-400" />
  }

  // ✅ Text
  const getText = () => {
    if (!isOnline) return isPersian ? 'آفلاین' : 'Offline'
    if (isFullSyncing) return isPersian ? 'Sync کامل...' : 'Full sync...'
    if (status === 'syncing') return isPersian ? 'در حال Sync...' : 'Syncing...'
    if (status === 'error') return isPersian ? 'خطای Sync' : 'Sync error'
    if (status === 'synced') return isPersian ? 'Sync شد' : 'Synced'
    return isPersian ? 'آنلاین' : 'Online'
  }

  // ✅ Color
  const getColor = () => {
    if (!isOnline)
      return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30'
    if (status === 'syncing' || isFullSyncing)
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
    if (status === 'error')
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
    if (status === 'synced')
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
    return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
  }

  const isBusy = status === 'syncing' || isFullSyncing
  const canSync = isOnline && !isBusy

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:shadow-md ${getColor()}`}
        title={getText()}
        aria-label={getText()}
      >
        {getIcon()}
        <span className="hidden sm:inline">{getText()}</span>
        {(queueSize ?? 0) > 0 && (
          <span className="bg-white/70 dark:bg-black/30 px-1.5 rounded-full text-[10px] font-bold">
            {queueSize}
          </span>
        )}
      </button>

      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowDetails(false)}
            aria-hidden="true"
          />

          <div className="absolute top-full end-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="flex items-center gap-2">
                <FiDatabase size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {isPersian ? 'وضعیت Sync' : 'Sync Status'}
                </span>
              </div>

              <button
                onClick={handleManualSync}
                disabled={!canSync}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                title={isPersian ? 'Sync دستی' : 'Manual sync'}
              >
                <FiRefreshCw size={12} className={isBusy ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>
            </div>

            <div className="p-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  {isPersian ? 'اتصال:' : 'Connection:'}
                </span>
                <span
                  className={`flex items-center gap-1 font-medium ${
                    isOnline
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {isOnline ? (
                    <>
                      <FiCloud size={10} />
                      {isPersian ? 'آنلاین' : 'Online'}
                    </>
                  ) : (
                    <>
                      <FiWifiOff size={10} />
                      {isPersian ? 'آفلاین' : 'Offline'}
                    </>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  {isPersian ? 'وضعیت:' : 'Status:'}
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {getText()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  {isPersian ? 'تغییرات در صف:' : 'Queued changes:'}
                </span>
                <span
                  className={`font-medium ${
                    (queueSize ?? 0) > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {queueSize ?? 0}
                </span>
              </div>

              {lastSyncAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FiClock size={10} />
                    {isPersian ? 'آخرین Sync:' : 'Last sync:'}
                  </span>
                  <span className="text-gray-700 dark:text-gray-200">
                    {formatRelativeTimeByLang(lastSyncAt)}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 pt-0">
              <button
                onClick={handleFullSync}
                disabled={!canSync}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  isPersian
                    ? 'دریافت مجدد همه داده‌ها از سرور'
                    : 'Re-fetch all data from server'
                }
              >
                <FiZap size={12} className={isFullSyncing ? 'animate-pulse' : ''} />
                <span>
                  {isFullSyncing
                    ? isPersian
                      ? 'در حال Full Sync...'
                      : 'Full syncing...'
                    : isPersian
                    ? 'Full Sync (اجباری)'
                    : 'Force Full Sync'}
                </span>
              </button>

              <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                {isPersian
                  ? 'در صورت عدم هماهنگی بین دستگاه‌ها، از Full Sync استفاده کنید'
                  : 'Use Full Sync if devices are out of sync'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SyncIndicator