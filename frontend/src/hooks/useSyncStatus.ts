import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { syncQueue } from '../services/syncQueue'
import type { RootState } from '../app/store'

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSyncAt: string | null
  lastError: string | null
  queueSize: number
  status: 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
}

export const useSyncStatus = (): SyncStatus => {
  const syncState = useSelector((s: RootState) => (s as any).sync) as {
    status?: string
    lastSyncAt?: string | null
    lastError?: string | null
    queueSize?: number
  } | undefined

  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [queueSize, setQueueSize] = useState<number>(syncState?.queueSize || 0)

  // ✅ آنلاین/آفلاین
  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // ✅ صف سینک هر ۵ ثانیه
  useEffect(() => {
    let mounted = true
    const tick = async () => {
      try {
        const size = await syncQueue.size()
        if (mounted) setQueueSize(size)
      } catch {}
    }
    tick()
    const interval = setInterval(tick, 5000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const isSyncing = syncState?.status === 'syncing'
  const hasError = !!syncState?.lastError

  let status: SyncStatus['status'] = 'idle'
  if (!isOnline) status = 'offline'
  else if (isSyncing) status = 'syncing'
  else if (hasError) status = 'error'
  else if (syncState?.lastSyncAt) status = 'synced'

  return {
    isOnline,
    isSyncing,
    lastSyncAt: syncState?.lastSyncAt ?? null,
    lastError: syncState?.lastError ?? null,
    queueSize,
    status,
  }
}

export default useSyncStatus