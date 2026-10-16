import Dexie from 'dexie'

// ═══════════════════════════════════════════════
// ✅ Dexie Database — Sync Queue (IndexedDB)
// ═══════════════════════════════════════════════
export const queueDB = new Dexie('smart-planner-sync')

queueDB.version(1).stores({
  // ✅ Changes queue
  // id: auto-increment PK
  // entity + entityId: برای dedup
  // queuedAt: برای sort
  changes: '++id, entity, entityId, queuedAt, [entity+entityId]'
})

// ✅ Handle version change (مثلاً وقتی tab دیگه‌ای DB رو ارتقا می‌ده)
queueDB.on('versionchange', () => {
  console.warn('⚠️ IndexedDB version changed — closing & reloading')
  queueDB.close()
  window.location.reload()
})

// ✅ Handle blocked (وقتی tab دیگه‌ای DB رو باز نگه داشته)
queueDB.on('blocked', () => {
  console.warn('⚠️ IndexedDB blocked by another tab')
})

export default queueDB