import Dexie, { type Table } from 'dexie'

// ✅ Interface برای یک تغییر در صف
export interface QueueChange {
  id?: number
  entity: string
  entityId: string
  data: Record<string, any>
  isDelete: boolean
  queuedAt: number
}

export class SmartPlannerDB extends Dexie {
  changes!: Table<QueueChange, number>

  constructor() {
    super('smart-planner-sync')
    this.version(1).stores({
      changes: '++id, entity, entityId, queuedAt, [entity+entityId]'
    })
  }
}

export const queueDB = new SmartPlannerDB()

queueDB.on('versionchange', () => {
  console.warn('⚠️ IndexedDB version changed — closing & reloading')
  queueDB.close()
  window.location.reload()
})

queueDB.on('blocked', () => {
  console.warn('⚠️ IndexedDB blocked by another tab')
})

export default queueDB