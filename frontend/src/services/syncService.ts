// ═══════════════════════════════════════════════
// ✅ Sync Service — مدیریت sync loop (Safe Version)
// ═══════════════════════════════════════════════

import { syncApi } from './syncApi'
import { syncQueue, lastSync } from './syncQueue'
import { ENTITY_MAP } from './syncEntities'
import { api } from './api'
import type { Store } from '@reduxjs/toolkit'
import { notifySyncError, notifySyncSuccess } from './notificationTriggers' // ✅ NEW

export interface SyncEvent {
  status?: 'syncing' | 'synced' | 'error'
  error?: string
  timestamp?: string
}

type Listener = (event: SyncEvent) => void

class SyncService {
  interval: ReturnType<typeof setInterval> | null = null
  isSyncing = false
  started = false
  listeners = new Set<Listener>()
  intervalMs = 30 * 1000
  retryCount = 0
  maxRetries = 3
  needsFullSync = true

  start(): void {
    if (this.started) return
    if (!api.getAccessToken()) {
      console.log('⏸️ Sync not started (not authenticated)')
      return
    }
    this.started = true
    this.needsFullSync = true
    console.log('✅ Sync service started (full sync on first run)')

    setTimeout(() => this.sync(), 5000)

    this.interval = setInterval(() => {
      if (navigator.onLine && api.getAccessToken()) {
        this.sync()
      }
    }, this.intervalMs)

    window.addEventListener('online', this.handleOnline)
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    window.removeEventListener('online', this.handleOnline)
    this.started = false
    this.needsFullSync = true
    console.log('⏸️ Sync service stopped')
  }

  handleOnline = (): void => {
    console.log('🌐 Back online — syncing...')
    setTimeout(() => this.sync(), 1500)
  }

  async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('⏸️ Sync already in progress')
      return
    }
    if (!api.getAccessToken()) {
      console.log('⏸️ Sync skipped (no auth)')
      return
    }
    if (!navigator.onLine) {
      console.log('⏸️ Sync skipped (offline)')
      return
    }

    this.isSyncing = true
    this.notify({ status: 'syncing' })

    try {
      const queue = await syncQueue.getAll()
      const since = this.needsFullSync ? null : lastSync.get()

      console.log(
        `🔄 Syncing... (queue: ${queue.length}, since: ${since || 'FULL'}${this.needsFullSync ? ' [FULL SYNC]' : ''})`
      )

      const result = await syncApi.full(queue, since)

      if (result.push) {
        console.log(`✅ Push: ${result.push.applied} applied, ${result.push.conflicts} conflicts`)

        const { applied = 0, conflicts = 0, skipped = 0, errors = [] } = result.push
        const processedCount = applied + conflicts + skipped + errors.length

        if (queue.length > 0) {
          if (processedCount < queue.length) {
            throw new Error(`Server processed only ${processedCount}/${queue.length} items`)
          } else if (errors.length > 0) {
            console.warn(`⚠️ ${errors.length} items failed. Keeping queue for retry.`)
            throw new Error('Partial sync error')
          } else {
            await syncQueue.clear()
            console.log('🧹 Queue cleared safely')
          }
        }

        // ✅ NEW: اعلان موفقیت (فقط اگر واقعاً چیزی push شده باشد)
        if (applied > 0) {
          notifySyncSuccess(applied)
        }
      }

      if (result.pull && result.pull.entities) {
        const totalChanges: number = (Object.values(result.pull.entities) as any[][])
          .reduce<number>((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)

        if (totalChanges > 0) {
          console.log(`📥 Pull: ${totalChanges} changes`)
          const { store } = await import('../app/store')
          this.applyRemoteChanges(store, result.pull.entities)
        } else {
          console.log('📥 Pull: 0 changes')
        }

        if (result.pull.serverTime) {
          lastSync.set(result.pull.serverTime)
        }
      }

      if (this.needsFullSync) {
        this.needsFullSync = false
        console.log('🎉 Full sync complete — switching to incremental')
      }

      this.retryCount = 0
      this.notify({ status: 'synced', timestamp: new Date().toISOString() })
      console.log('✅ Sync complete')
    } catch (error: any) {
      console.error('❌ Sync failed:', error.message)

      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        const delay = Math.pow(2, this.retryCount) * 1000
        console.log(`🔁 Retry ${this.retryCount}/${this.maxRetries} in ${delay}ms`)
        setTimeout(() => this.sync(), delay)
      } else {
        this.notify({ status: 'error', error: error.message })
        notifySyncError(error.message)  // ✅ NEW
      }
    } finally {
      this.isSyncing = false
    }
  }

  applyRemoteChanges(store: Store, entities: Record<string, any[]>): void {
    for (const [entityName, remoteItems] of Object.entries(entities)) {
      if (!remoteItems || remoteItems.length === 0) continue

      const config = Object.values(ENTITY_MAP).find(
        (c: any) => c.backendName === entityName
      )
      if (!config) {
        console.warn(`No config for entity: ${entityName}`)
        continue
      }

      const sliceName = (config as any).sliceName
      const actionType = `sync/merge${sliceName.charAt(0).toUpperCase() + sliceName.slice(1)}`

      store.dispatch({
        type: actionType,
        payload: {
          entity: entityName,
          items: remoteItems,
          statePath: (config as any).statePath,
        },
      })
    }
  }

  notify(event: SyncEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('Listener error:', error)
      }
    })
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getStatus() {
    return {
      started: this.started,
      isSyncing: this.isSyncing,
      queueSize: syncQueue.size(),
      lastSync: lastSync.get(),
      needsFullSync: this.needsFullSync,
    }
  }

  async forceSync(): Promise<void> {
    console.log('🔄 Manual sync triggered')
    await this.sync()
  }

  async forceFullSync(): Promise<void> {
    console.log('🔄 Forced full sync triggered')
    this.needsFullSync = true
    await this.sync()
  }

  async reset(_entity: string | null = null): Promise<any> {
    return await syncApi.reset()
  }
}

export const syncService = new SyncService()
export default syncService