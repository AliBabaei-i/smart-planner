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
        this.intervalMs = 30 * 1000 // ۳۰ ثانیه
        this.retryCount = 0
        this.maxRetries = 3
    }

    // ═══════════════════════════════════════════════
    // ✅ شروع
    // ═══════════════════════════════════════════════
    start() {
        if (this.started) return

        // ✅ اگه لاگین نیست، شروع نکن
        if (!api.getAccessToken()) {
            console.log('⏸️ Sync not started (not authenticated)')
            return
        }

        this.started = true
        console.log('✅ Sync service started')

        // ✅ sync اولیه بعد از ۵ ثانیه
        setTimeout(() => this.sync(), 5000)

        // ✅ loop هر ۳۰ ثانیه
        this.interval = setInterval(() => {
            // ✅ فقط اگه آنلاینیم و لاگین هستیم
            if (navigator.onLine && api.getAccessToken()) {
                this.sync()
            }
        }, this.intervalMs)

        // ✅ online شد → فوری sync
        window.addEventListener('online', this.handleOnline)
    }

    // ═══════════════════════════════════════════════
    // ✅ توقف
    // ═══════════════════════════════════════════════
    stop() {
        if (this.interval) {
            clearInterval(this.interval)
            this.interval = null
        }
        window.removeEventListener('online', this.handleOnline)
        this.started = false
        console.log('⏸️ Sync service stopped')
    }

    // ═══════════════════════════════════════════════
    // ✅ Online handler
    // ═══════════════════════════════════════════════
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
            const since = lastSync.get()

            console.log(`🔄 Syncing... (queue: ${queue.length}, since: ${since || 'beginning'})`)

            // ✅ Push + Pull یکجا
            const result = await syncApi.full(queue, since)

            // ✅ اگه push موفق بود
            if (result.push) {
                console.log(`✅ Push: ${result.push.applied} applied, ${result.push.conflicts} conflicts`)

                // ✅ پاک کردن از queue اون‌هایی که موفق بودن
                if (result.push.applied > 0 || result.push.conflicts > 0) {
                    // ✅ همه رو پاک کن (چون backend خودش conflict detection می‌کنه)
                    syncQueue.clear()
                }
            }

            // ✅ اگه pull تغییرات داشت
            if (result.pull && result.pull.entities) {
                const totalChanges = Object.values(result.pull.entities)
                    .reduce((sum, arr) => sum + arr.length, 0)

                if (totalChanges > 0) {
                    console.log(`📥 Pull: ${totalChanges} changes`)

                    // ✅ اعمال تغییرات در Redux
                    const { store } = await import('../app/store')
                    this.applyRemoteChanges(store, result.pull.entities)
                }

                // ✅ ذخیره last sync
                if (result.pull.serverTime) {
                    lastSync.set(result.pull.serverTime)
                }
            }

            this.retryCount = 0
            this.notify({ status: 'synced', timestamp: new Date().toISOString() })
            console.log('✅ Sync complete')
        } catch (error) {
            console.error('❌ Sync failed:', error.message)

            // ✅ retry logic
            if (this.retryCount < this.maxRetries) {
                this.retryCount++
                const delay = Math.pow(2, this.retryCount) * 1000 // exponential backoff
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

            // ✅ پیدا کردن config
            const config = Object.values(ENTITY_MAP).find(
                c => c.backendName === entityName
            )

            if (!config) {
                console.warn(`No config for entity: ${entityName}`)
                continue
            }

            // ✅ dispatch action خاص برای هر slice
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

    // ═══════════════════════════════════════════════
    // ✅ Notify listeners
    // ═══════════════════════════════════════════════
    notify(event) {
        this.listeners.forEach(listener => {
            try {
                listener(event)
            } catch (error) {
                console.error('Listener error:', error)
            }
        })
    }

    // ═══════════════════════════════════════════════
    // ✅ Subscribe
    // ═══════════════════════════════════════════════
    subscribe(listener) {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    // ═══════════════════════════════════════════════
    // ✅ وضعیت
    // ═══════════════════════════════════════════════
    getStatus() {
        return {
            started: this.started,
            isSyncing: this.isSyncing,
            queueSize: syncQueue.size(),
            lastSync: lastSync.get()
        }
    }

    // ═══════════════════════════════════════════════
    // ✅ Manual sync
    // ═══════════════════════════════════════════════
    async forceSync() {
        console.log('🔄 Manual sync triggered')
        await this.sync()
    }
}

export const syncService = new SyncService()
// ═══════════════════════════════════════════════
// ✅ Reset — پاک کردن همه داده‌های کاربر از سرور
// ═══════════════════════════════════════════════
export const resetUserData = (userId) => {
    const results = {}

    transaction(() => {
        for (const [entityName, config] of Object.entries(SYNC_ENTITIES)) {
            try {
                const result = run(
                    `DELETE FROM ${config.table} WHERE user_id = ?`,
                    [userId]
                )
                results[entityName] = result.changes || 0
            } catch (error) {
                logger.error(`Reset failed for ${entityName}:`, error.message)
                results[entityName] = -1
            }
        }
    })

    return results
}
export default {
    pushChanges,
    pullChanges,
    fullSync,
    resetUserData
}