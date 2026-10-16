// ═══════════════════════════════════════════════
// ✅ پاک‌سازی LocalStorage قدیمی
// فقط یک بار اجرا کن، بعد فایل رو حذف کن
// ═══════════════════════════════════════════════

export const cleanupOldStorage = () => {
  const OLD_KEYS = [
    'smart-planner-tasks',
    'smart-planner-projects',
    'smart-planner-habits',
    'smart-planner-notes',
    'smart-planner-goals',
    'smart-planner-growth',
    'smart-planner-dashboard-layout',
    'smart-planner-achievements',
    'smart-planner-pomodoro',
    'smart-planner-theme',
    'smart-planner-notifications',
    'smart-planner-finance'
  ]

  let cleaned = 0
  OLD_KEYS.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
      cleaned++
      console.log(`🗑️ Removed: ${key}`)
    }
  })

  console.log(`✅ Cleaned ${cleaned} old keys`)
  return cleaned
}

// ✅ در dev، روی window بذار
if (import.meta.env.DEV) {
  window.cleanupOldStorage = cleanupOldStorage
  console.log('💡 برای پاک‌سازی: window.cleanupOldStorage()')
}