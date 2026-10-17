import { queueDB, type QueueChange } from './queueDB'

const LAST_SYNC_KEY = 'smart-planner-last-sync'
const OLD_QUEUE_KEY = 'smart-planner-sync-queue'
const MAX_QUEUE_SIZE = 5000

export const syncQueue = {
  async getAll(): Promise<QueueChange[]> {
    try {
      return await queueDB.changes.orderBy('queuedAt').toArray()
    } catch (error) {
      console.error('syncQueue.getAll failed:', error)
      return []
    }
  },

  async add(change: Omit<QueueChange, 'id' | 'entityId' | 'queuedAt'>): Promise<void> {
    try {
      const entity = change.entity
      const entityId = change.data?.id

      if (!entity || !entityId) {
        console.warn('syncQueue.add: invalid change (missing entity or id)', change)
        return
      }

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
        await queueDB.changes.update(existing.id!, item)
      } else {
        await queueDB.changes.add(item)
      }

      const count = await queueDB.changes.count()
      if (count > MAX_QUEUE_SIZE) {
        const excess = count - MAX_QUEUE_SIZE
        const oldest = await queueDB.changes.orderBy('queuedAt').limit(excess).toArray()
        const ids = oldest.map(o => o.id!)
        await queueDB.changes.bulkDelete(ids)
        console.warn(`⚠️ Trimmed ${excess} old queue items`)
      }
    } catch (error) {
      console.error('syncQueue.add failed:', error)
    }
  },

  async addMany(changes: any[]): Promise<void> {
    if (!changes || changes.length === 0) return
    for (const change of changes) {
      await this.add(change)
    }
  },

  async clear(): Promise<void> {
    try {
      await queueDB.changes.clear()
    } catch (error) {
      console.error('syncQueue.clear failed:', error)
    }
  },

  async removeByIds(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) return
    try {
      await queueDB.changes.bulkDelete(ids)
    } catch (error) {
      console.error('syncQueue.removeByIds failed:', error)
    }
  },

  async size(): Promise<number> {
    try {
      return await queueDB.changes.count()
    } catch {
      return 0
    }
  },

  async isEmpty(): Promise<boolean> {
    return (await this.size()) === 0
  },

  async migrateFromLocalStorage(): Promise<boolean> {
    try {
      const raw = localStorage.getItem(OLD_QUEUE_KEY)
      if (!raw) return false

      let oldQueue: any[] = []
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
        } catch (e: any) {
          console.warn('Skip invalid queue item:', e.message)
        }
      }

      localStorage.removeItem(OLD_QUEUE_KEY)
      console.log(`✅ Migrated ${migrated}/${oldQueue.length} items to IndexedDB`)
      return true
    } catch (error) {
      console.error('Queue migration failed:', error)
      return false
    }
  },

  async debugDump(): Promise<QueueChange[]> {
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

export const lastSync = {
  get(): string | null {
    try {
      return localStorage.getItem(LAST_SYNC_KEY)
    } catch {
      return null
    }
  },
  set(timestamp: string): void {
    try {
      localStorage.setItem(LAST_SYNC_KEY, timestamp)
    } catch (error) {
      console.error('lastSync.set failed:', error)
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(LAST_SYNC_KEY)
    } catch {}
  }
}

export default { syncQueue, lastSync }