// ═══════════════════════════════════════════════
// ✅ Redux-Persist Migrations
// ═══════════════════════════════════════════════
export const migrations = {
  // v0 → v1
  1: (state) => {
    if (!state) return state
    console.log('🔄 Migrating to v1')
    return state
  },

  // v1 → v2
  2: (state) => {
    if (!state) return state
    console.log('🔄 Migrating to v2')
    return state
  },

  // v2 → v3
  3: (state) => {
    if (!state) return state
    console.log('🔄 Migrating to v3')
    return state
  },

  // v3 → v4 — افزودن sync slice
  4: (state) => {
    if (!state) return state
    console.log('🔄 Migrating to v4 (sync)')
    return {
      ...state,
      sync: state.sync || {
        status: 'idle',
        lastSyncAt: null,
        lastError: null,
        queueSize: 0,
        isEnabled: true
      }
    }
  },

  // ✅ v4 → v5 — مهاجرت به IndexedDB
  5: (state) => {
    if (!state) return state
    console.log('🔄 Migrating to v5 (IndexedDB storage)')
    // ✅ تغییرات داده‌ای لازم نیست — فقط storage engine عوض شده
    return state
  }
}

export const CURRENT_VERSION = 5