// ═══════════════════════════════════════════════
// ✅ Sync Queue — ذخیره تغییرات در localStorage
// ═══════════════════════════════════════════════

const QUEUE_KEY = 'smart-planner-sync-queue'
const LAST_SYNC_KEY = 'smart-planner-last-sync'
const MAX_QUEUE_SIZE = 2000

// ═══════════════════════════════════════════════
// ✅ Helper
// ═══════════════════════════════════════════════
const safeParse = (str, fallback) => {
  try {
    return JSON.parse(str) || fallback
  } catch {
    return fallback
  }
}

// ═══════════════════════════════════════════════
// ✅ Queue Management
// ═══════════════════════════════════════════════
export const syncQueue = {
  // ✅ همه تغییرات
  getAll() {
    try {
      const raw = localStorage.getItem(QUEUE_KEY)
      return safeParse(raw, [])
    } catch {
      return []
    }
  },

  // ✅ ذخیره تغییرات
  setAll(changes) {
    try {
      // ✅ اگه از سقف رد شد، قدیمی‌ترها رو حذف کن
      if (changes.length > MAX_QUEUE_SIZE) {
        changes = changes.slice(-MAX_QUEUE_SIZE)
      }
      localStorage.setItem(QUEUE_KEY, JSON.stringify(changes))
    } catch (error) {
      console.error('Failed to save queue:', error)
    }
  },

  // ✅ اضافه کردن تغییر
  add(change) {
    const queue = this.getAll()
    
    // ✅ اگه این آیتم قبلاً توی صف بود، جایگزینش کن
    const existingIndex = queue.findIndex(
      c => c.entity === change.entity && c.data?.id === change.data?.id
    )
    
    if (existingIndex !== -1) {
      queue[existingIndex] = change
    } else {
      queue.push(change)
    }
    
    this.setAll(queue)
  },

  // ✅ اضافه کردن چند تغییر
  addMany(changes) {
    if (!changes || changes.length === 0) return
    
    const queue = this.getAll()
    
    for (const change of changes) {
      const existingIndex = queue.findIndex(
        c => c.entity === change.entity && c.data?.id === change.data?.id
      )
      
      if (existingIndex !== -1) {
        queue[existingIndex] = change
      } else {
        queue.push(change)
      }
    }
    
    this.setAll(queue)
  },

  // ✅ پاک کردن
  clear() {
    try {
      localStorage.removeItem(QUEUE_KEY)
    } catch (error) {
      console.error('Failed to clear queue:', error)
    }
  },

  // ✅ حذف تغییرات موفق
  removeByIds(ids) {
    if (!ids || ids.length === 0) return
    const idSet = new Set(ids)
    const queue = this.getAll().filter(c => !idSet.has(c.data?.id))
    this.setAll(queue)
  },

  // ✅ تعداد
  size() {
    return this.getAll().length
  },

  // ✅ چک خالی بودن
  isEmpty() {
    return this.size() === 0
  }
}

// ═══════════════════════════════════════════════
// ✅ Last Sync Management
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
      console.error('Failed to save last sync:', error)
    }
  },

  clear() {
    try {
      localStorage.removeItem(LAST_SYNC_KEY)
    } catch {}
  }
}

export default { syncQueue, lastSync }