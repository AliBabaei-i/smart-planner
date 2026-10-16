import { get, set, del } from 'idb-keyval'

// ═══════════════════════════════════════════════
// ✅ Custom Storage for redux-persist (IndexedDB)
// ✅ Auto-migration از localStorage در اولین خواندن
// ═══════════════════════════════════════════════

const PERSIST_PREFIX = 'persist:'

// ✅ کلیدهایی که نباید از localStorage migrate بشن (اگه لازم شد)
const SKIP_MIGRATION_KEYS = []

// ═══════════════════════════════════════════════
// ✅ Auto-migration
// ═══════════════════════════════════════════════
const autoMigrate = async (key) => {
  // ✅ اول IndexedDB
  let idbValue
  try {
    idbValue = await get(key)
  } catch (error) {
    console.error(`idb get("${key}") failed:`, error)
  }

  if (idbValue !== undefined) {
    return idbValue
  }

  // ✅ اگه کلید از migration معاف بود
  if (SKIP_MIGRATION_KEYS.includes(key)) return undefined

  // ✅ Fallback: localStorage (فقط یک‌بار)
  try {
    const lsValue = localStorage.getItem(key)
    if (lsValue !== null) {
      await set(key, lsValue)
      console.log(`✅ Auto-migrated "${key}" from localStorage → IndexedDB`)
      return lsValue
    }
  } catch (error) {
    console.error(`localStorage migration failed for "${key}":`, error)
  }

  return undefined
}

// ═══════════════════════════════════════════════
// ✅ Storage Adapter for redux-persist
// ═══════════════════════════════════════════════
const storage = {
  getItem: async (key) => {
    try {
      const value = await autoMigrate(key)
      return value ?? null
    } catch (error) {
      console.error(`persistStorage.getItem("${key}") failed:`, error)
      return null
    }
  },

  setItem: async (key, value) => {
    try {
      await set(key, value)
    } catch (error) {
      console.error(`persistStorage.setItem("${key}") failed:`, error)
    }
  },

  removeItem: async (key) => {
    try {
      await del(key)
    } catch (error) {
      console.error(`persistStorage.removeItem("${key}") failed:`, error)
    }
  }
}

// ═══════════════════════════════════════════════
// ✅ Diagnostic helpers
// ═══════════════════════════════════════════════
export async function getStorageInfo() {
  try {
    const PERSIST_KEY = PERSIST_PREFIX + 'smart-planner'
    const idbValue = await get(PERSIST_KEY)
    const lsValue = localStorage.getItem(PERSIST_KEY)

    return {
      indexedDB: idbValue ? `${Math.round((idbValue.length || 0) / 1024)} KB` : 'empty',
      localStorage: lsValue ? `${Math.round((lsValue.length || 0) / 1024)} KB` : 'empty',
      migrated: !!idbValue
    }
  } catch (error) {
    return { error: error.message }
  }
}

// ✅ Force re-migration (dev only)
export async function forceMigration() {
  try {
    const PERSIST_KEY = PERSIST_PREFIX + 'smart-planner'
    const lsValue = localStorage.getItem(PERSIST_KEY)
    if (!lsValue) {
      console.warn('Nothing to migrate from localStorage')
      return false
    }
    await set(PERSIST_KEY, lsValue)
    console.log('✅ Force migration complete')
    return true
  } catch (error) {
    console.error('Force migration failed:', error)
    return false
  }
}

// ✅ پاک کردن persist از IndexedDB (برای Reset)
export async function clearPersistStorage() {
  try {
    const PERSIST_KEY = PERSIST_PREFIX + 'smart-planner'
    await del(PERSIST_KEY)
    console.log('🗑️ Cleared persist storage from IndexedDB')
  } catch (error) {
    console.error('Clear persist storage failed:', error)
  }
}

export default storage