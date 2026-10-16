import { syncApi } from './syncApi'
import { syncQueue, lastSync } from './syncQueue'
import { ENTITY_MAP } from './syncEntities'
import { api } from './api'

// ═══════════════════════════════════════════════
// ✅ Sync Service — مدیریت sync loop
// ═══════════════════════════════════════════════
class SyncService {
  constructor() {
    this.interval = null
    this.isSyncing = false
    this.started = false
    this.listeners = new Set()
    this.intervalMs = 30 * 1000
    this.retryCount = 0
    this.maxRetries = 3

    // ✅ فلگ Full Sync اولیه
    // وقتی اپ بوت می‌شه یا لاگین می‌کنی، اولین sync با since=null انجام می‌شه
    this.needsFullSync = true
  }

  // ═══════════════════════════════════════════════
  // ✅ شروع
  // ═══════════════════════════════════════════════
  start() {
    if (this.started) return

    if (!api.getAccessToken()) {
      console.log('⏸️ Sync not started (not authenticated)')
      return
    }

    this.started = true
    // ✅ هر بار که سرویس restart می‌شه، Full Sync لازمه
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

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    window.removeEventListener('online', this.handleOnline)
    this.started = false
    // ✅ دفعه بعد که start شد، full sync لازمه
    this.needsFullSync = true
    console.log('⏸️ Sync service stopped')
  }

  handleOnline = () => {
    console.log('🌐 Back online — syncing...')
    setTimeout(() => this.sync(), 1500)
  }

  // ═══════════════════════════════════════════════
  // ✅ Sync اصلی
  // ═══════════════════════════════════════════════
  async sync() {
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
      const queue = syncQueue.getAll()

      // ✅ تصمیم درباره since:
      // - اگه needsFullSync هست → null (کل داده‌ها)
      // - وگرنه → lastSync ذخیره‌شده
      const since = this.needsFullSync ? null : lastSync.get()

      console.log(
        `🔄 Syncing... (queue: ${queue.length}, since: ${since || 'FULL'}${this.needsFullSync ? ' [FULL SYNC]' : ''})`
      )

      const result = await syncApi.full(queue, since)

      // ✅ Push
      if (result.push) {
        console.log(`✅ Push: ${result.push.applied} applied, ${result.push.conflicts} conflicts`)

        // ✅ صف رو پاک کن اگه خطای per-entity نبود
        if (!result.push.errors || result.push.errors.length === 0) {
          syncQueue.clear()
        }
      }

      // ✅ Pull
      if (result.pull && result.pull.entities) {
        const totalChanges = Object.values(result.pull.entities)
          .reduce((sum, arr) => sum + arr.length, 0)

        if (totalChanges > 0) {
          console.log(`📥 Pull: ${totalChanges} changes`)
          const { store } = await import('../app/store')
          this.applyRemoteChanges(store, result.pull.entities)
        } else {
          console.log('📥 Pull: 0 changes')
        }

        // ✅ ذخیره lastSync
        if (result.pull.serverTime) {
          lastSync.set(result.pull.serverTime)
        }
      }

      // ✅ Full sync تمام شد
      if (this.needsFullSync) {
        this.needsFullSync = false
        console.log('🎉 Full sync complete — switching to incremental')
      }

      this.retryCount = 0
      this.notify({ status: 'synced', timestamp: new Date().toISOString() })
      console.log('✅ Sync complete')
    } catch (error) {
      console.error('❌ Sync failed:', error.message)

      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        const delay = Math.pow(2, this.retryCount) * 1000
        console.log(`🔁 Retry ${this.retryCount}/${this.maxRetries} in ${delay}ms`)
        setTimeout(() => this.sync(), delay)
      } else {
        this.notify({ status: 'error', error: error.message })
      }
    } finally {
      this.isSyncing = false
    }
  }

  // ═══════════════════════════════════════════════
  // ✅ اعمال تغییرات remote در Redux
  // ═══════════════════════════════════════════════
  applyRemoteChanges(store, entities) {
    for (const [entityName, remoteItems] of Object.entries(entities)) {
      if (!remoteItems || remoteItems.length === 0) continue

      const config = Object.values(ENTITY_MAP).find(
        c => c.backendName === entityName
      )

      if (!config) {
        console.warn(`No config for entity: ${entityName}`)
        continue
      }

      const actionType = `sync/merge${config.sliceName.charAt(0).toUpperCase() + config.sliceName.slice(1)}`

      store.dispatch({
        type: actionType,
        payload: {
          entity: entityName,
          items: remoteItems,
          statePath: config.statePath
        }
      })
    }
  }

  notify(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Listener error:', error)
      }
    })
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getStatus() {
    return {
      started: this.started,
      isSyncing: this.isSyncing,
      queueSize: syncQueue.size(),
      lastSync: lastSync.get(),
      needsFullSync: this.needsFullSync
    }
  }

  async forceSync() {
    console.log('🔄 Manual sync triggered')
    await this.sync()
  }

  // ✅ Force Full Sync — برای مواقع اضطراری
  async forceFullSync() {
    console.log('🔄 Forced full sync triggered')
    this.needsFullSync = true
    await this.sync()
  }

  async reset(entity = null) {
    return await syncApi.reset(entity)
  }
}

export const syncService = new SyncService()
export default syncService