import { queueDB } from './queueDB'

// ═══════════════════════════════════════════════
// ✅ Constants
// ═══════════════════════════════════════════════
const LAST_SYNC_KEY = 'smart-planner-last-sync'
const OLD_QUEUE_KEY = 'smart-planner-sync-queue'
const MAX_QUEUE_SIZE = 5000

// ═══════════════════════════════════════════════
// ✅ Sync Queue — IndexedDB-backed
// ═══════════════════════════════════════════════
export const syncQueue = {
  // ✅ همه تغییرات (مرتب‌شده بر اساس زمان)
  async getAll() {
    try {
      return await queueDB.changes.orderBy('queuedAt').toArray()
    } catch (error) {
      console.error('syncQueue.getAll failed:', error)
      return []
    }
  },

  // ✅ اضافه کردن تغییر (با dedup)
  async add(change) {
    try {
      const entity = change.entity
      const entityId = change.data?.id

      if (!entity || !entityId) {
        console.warn('syncQueue.add: invalid change (missing entity or id)', change)
        return
      }

      // ✅ چک کن قبلاً بود؟
      const existing = await queueDB.changes
        .where('[entity+entityId]')
        .equals([entity, entityId])
        .first()

      const item = {
        entity,
        entityId,
        data: change.data,
        isDelete: !!change.isDelete,
        queuedAt: Date.now()
      }

      if (existing) {
        // ✅ جایگزین کن (آخرین نسخه برنده)
        await queueDB.changes.update(existing.id, item)
      } else {
        await queueDB.changes.add(item)
      }

      // ✅ Trim اگر از سقف رد شد
      const count = await queueDB.changes.count()
      if (count > MAX_QUEUE_SIZE) {
        const excess = count - MAX_QUEUE_SIZE
        const oldest = await queueDB.changes
          .orderBy('queuedAt')
          .limit(excess)
          .toArray()
        const ids = oldest.map(o => o.id)
        await queueDB.changes.bulkDelete(ids)
        console.warn(`⚠️ Trimmed ${excess} old queue items`)
      }
    } catch (error) {
      console.error('syncQueue.add failed:', error)
    }
  },

  // ✅ اضافه کردن چند تغییر
  async addMany(changes) {
    if (!changes || changes.length === 0) return
    for (const change of changes) {
      await this.add(change)
    }
  },

  // ✅ پاک کردن همه
  async clear() {
    try {
      await queueDB.changes.clear()
    } catch (error) {
      console.error('syncQueue.clear failed:', error)
    }
  },

  // ✅ حذف بر اساس ID
  async removeByIds(ids) {
    if (!ids || ids.length === 0) return
    try {
      await queueDB.changes.bulkDelete(ids)
    } catch (error) {
      console.error('syncQueue.removeByIds failed:', error)
    }
  },

  // ✅ تعداد
  async size() {
    try {
      return await queueDB.changes.count()
    } catch {
      return 0
    }
  },

  async isEmpty() {
    return (await this.size()) === 0
  },

  // ═══════════════════════════════════════════════
  // ✅ One-time migration از localStorage
  // ═══════════════════════════════════════════════
  async migrateFromLocalStorage() {
    try {
      const raw = localStorage.getItem(OLD_QUEUE_KEY)
      if (!raw) return false

      let oldQueue = []
      try {
        oldQueue = JSON.parse(raw)
      } catch {
        localStorage.removeItem(OLD_QUEUE_KEY)
        return false
      }

      if (!Array.isArray(oldQueue) || oldQueue.length === 0) {
        localStorage.removeItem(OLD_QUEUE_KEY)
        return false
      }

      let migrated = 0
      for (const change of oldQueue) {
        try {
          await this.add(change)
          migrated++
        } catch (e) {
          console.warn('Skip invalid queue item:', e.message)
        }
      }

      localStorage.removeItem(OLD_QUEUE_KEY)
      console.log(`✅ Migrated ${migrated}/${oldQueue.length} items from localStorage → IndexedDB`)
      return true
    } catch (error) {
      console.error('Queue migration failed:', error)
      return false
    }
  },

  // ═══════════════════════════════════════════════
  // ✅ Debug helper
  // ═══════════════════════════════════════════════
  async debugDump() {
    const all = await this.getAll()
    console.table(all.map(c => ({
      entity: c.entity,
      id: c.entityId?.slice(0, 8),
      isDelete: c.isDelete,
      queuedAt: new Date(c.queuedAt).toLocaleTimeString()
    })))
    return all
  }
}

// ═══════════════════════════════════════════════
// ✅ Last Sync Management (localStorage — سبک)
// ═══════════════════════════════════════════════
export const lastSync = {
  get() {
    try {
      return localStorage.getItem(LAST_SYNC_KEY)
    } catch {
      return null
    }
  },

  set(timestamp) {
    try {
      localStorage.setItem(LAST_SYNC_KEY, timestamp)
    } catch (error) {
      console.error('lastSync.set failed:', error)
    }
  },

  clear() {
    try {
      localStorage.removeItem(LAST_SYNC_KEY)
    } catch {}
  }
}

export default { syncQueue, lastSync }