import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiRefreshCw, FiCloud, FiCloudOff, FiCheckCircle,
  FiAlertTriangle, FiClock, FiDatabase, FiZap
} from 'react-icons/fi'
import { motion } from 'framer-motion'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { syncService } from '../../services/syncService'
import { syncQueue } from '../../services/syncQueue'
import type { RootState } from '../../app/store'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

const SyncSettings = () => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const syncState = useSelector((state: RootState) => state.sync)
  const { status = 'idle', lastSyncAt = null, lastError = null, queueSize = 0 } = syncState || {}

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [localQueueSize, setLocalQueueSize] = useState(queueSize)

  // ✅ آنلاین/آفلاین
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

  // ✅ به‌روزرسانی size صف هر ۵ ثانیه
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const size = await syncQueue.size()
        setLocalQueueSize(size)
      } catch {}
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // ✅ دکمه Sync Now
  const handleSyncNow = useCallback(async () => {
    if (!isOnline) {
      toast.error(isPersian ? 'آفلاین هستید' : 'You are offline')
      return
    }
    if (isSyncing) return

    setIsSyncing(true)
    try {
      await syncService.forceSync()
      const size = await syncQueue.size()
      setLocalQueueSize(size)
      toast.success(isPersian ? 'سینک انجام شد' : 'Sync complete')
    } catch (error: any) {
      toast.error(isPersian ? 'سینک ناموفق' : 'Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, isPersian])

  // ✅ دکمه Force Full Sync
  const handleFullSync = useCallback(async () => {
    if (!isOnline) {
      toast.error(isPersian ? 'آفلاین هستید' : 'You are offline')
      return
    }
    if (isSyncing) return
    if (!window.confirm(
      isPersian
        ? 'سینک کامل ممکنه چند لحظه طول بکشه. ادامه بدی؟'
        : 'Full sync may take a moment. Continue?'
    )) return

    setIsSyncing(true)
    try {
      await syncService.forceFullSync()
      const size = await syncQueue.size()
      setLocalQueueSize(size)
      toast.success(isPersian ? 'سینک کامل انجام شد' : 'Full sync complete')
    } catch (error: any) {
      toast.error(isPersian ? 'سینک کامل ناموفق' : 'Full sync failed')
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, isPersian])

  // ✅ وضعیت‌ها
  const currentStatus: SyncStatus = isSyncing ? 'syncing' : (status as SyncStatus)

  const statusConfig = {
    idle: {
      icon: FiClock,
      color: 'text-gray-500',
      bg: 'bg-gray-100 dark:bg-gray-700',
      label: isPersian ? 'آماده' : 'Idle'
    },
    syncing: {
      icon: FiRefreshCw,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      label: isPersian ? 'در حال سینک...' : 'Syncing...'
    },
    synced: {
      icon: FiCheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      label: isPersian ? 'سینک شد' : 'Synced'
    },
    error: {
      icon: FiAlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      label: isPersian ? 'خطا' : 'Error'
    }
  }

  const config = statusConfig[currentStatus]
  const StatusIcon = config.icon

  // ✅ زمان نسبی
  const formatRelative = (iso: string | null) => {
    if (!iso) return isPersian ? 'هنوز سینک نشده' : 'Never synced'
    try {
      const d = new Date(iso)
      const diff = Date.now() - d.getTime()
      const mins = Math.floor(diff / 60000)
      const hours = Math.floor(mins / 60)
      const days = Math.floor(hours / 24)

      if (mins < 1) return isPersian ? 'همین الان' : 'Just now'
      if (mins < 60) return isPersian ? `${mins} دقیقه پیش` : `${mins}m ago`
      if (hours < 24) return isPersian ? `${hours} ساعت پیش` : `${hours}h ago`
      return isPersian ? `${days} روز پیش` : `${days}d ago`
    } catch {
      return iso
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiCloud className="text-blue-600 dark:text-blue-400" size={20} />
          <span>{isPersian ? 'سینک چنددستگاهی' : 'Multi-device Sync'}</span>
        </h3>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              <FiCloud size={12} />
              {isPersian ? 'آنلاین' : 'Online'}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              <FiCloudOff size={12} />
              {isPersian ? 'آفلاین' : 'Offline'}
            </span>
          )}
        </div>
      </div>

      {/* ✅ وضعیت اصلی */}
      <div className={`p-4 rounded-xl ${config.bg} mb-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 ${currentStatus === 'syncing' ? 'animate-spin' : ''}`}>
            <StatusIcon size={22} className={config.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-bold ${config.color}`}>{config.label}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {isPersian ? 'آخرین سینک: ' : 'Last sync: '}
              {formatRelative(lastSyncAt)}
            </div>
          </div>
        </div>

        {lastError && currentStatus === 'error' && (
          <div className="mt-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg text-xs text-red-700 dark:text-red-300">
            <strong>{isPersian ? 'خطا: ' : 'Error: '}</strong>
            {lastError}
          </div>
        )}
      </div>

      {/* ✅ آمار */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <FiDatabase size={12} />
            {isPersian ? 'صف تغییرات' : 'Queue'}
          </div>
          <div className={`text-lg font-bold ${localQueueSize > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
            {localQueueSize.toLocaleString(isPersian ? 'fa-IR' : 'en-US')}
          </div>
          <div className="text-[10px] text-gray-400">
            {localQueueSize === 0 
              ? (isPersian ? 'همه‌چیز سینک شده' : 'Everything synced')
              : (isPersian ? 'در انتظار آپلود' : 'Pending upload')
            }
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <FiClock size={12} />
            {isPersian ? 'آخرین سینک' : 'Last Sync'}
          </div>
          <div className="text-xs font-medium text-gray-900 dark:text-white mt-1">
            {lastSyncAt 
              ? new Date(lastSyncAt).toLocaleString(isPersian ? 'fa-IR' : 'en-US')
              : (isPersian ? '—' : '—')
            }
          </div>
        </div>
      </div>

      {/* ✅ دکمه‌ها */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleSyncNow}
          loading={isSyncing}
          disabled={!isOnline}
          className="flex-1 !bg-blue-600 hover:!bg-blue-700"
        >
          <FiRefreshCw size={16} />
          <span>{isPersian ? 'سینک الان' : 'Sync Now'}</span>
        </Button>

        <Button
          onClick={handleFullSync}
          disabled={!isOnline || isSyncing}
          variant="secondary"
        >
          <FiZap size={16} />
          <span>{isPersian ? 'سینک کامل' : 'Full Sync'}</span>
        </Button>
      </div>

      {/* ✅ توضیح کوچیک */}
      <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
        {isPersian
          ? 'سینک خودکار هر ۳۰ ثانیه انجام می‌شه. سینک کامل همه داده‌ها رو از سرور دوباره می‌گیره.'
          : 'Auto-sync runs every 30s. Full sync refetches all data from server.'
        }
      </p>
    </Card>
  )
}

export default SyncSettings