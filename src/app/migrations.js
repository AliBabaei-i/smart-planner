// ═══════════════════════════════════════════════
// ✅ Migrations برای redux-persist
// هر بار که ساختار state عوض می‌شه، یه migration اضافه کن
// ═══════════════════════════════════════════════

export const migrations = {
  // ═══════════════════════════════════════════════
  // Version 0 → 1: مهاجرت از middleware دستی به redux-persist
  // ═══════════════════════════════════════════════
  1: (state) => {
    if (!state) return state

    console.log('🔄 Migrating from v0 to v1...')

    // ✅ اطمینان از اینکه همه slice ها موجودن
    return {
      tasks: state.tasks || { tasks: [], availableTags: [], loading: false, error: null },
      projects: state.projects || { projects: [], loading: false, error: null },
      habits: state.habits || { habits: [], completions: {} },
      notes: state.notes || { notes: [] },
      goals: state.goals || { goals: [] },
      growth: state.growth || { journals: [], skills: [] },
      dashboard: state.dashboard || { layout: [], editMode: false },
      achievements: state.achievements || { unlocked: [], totalPoints: 0 },
      notifications: state.notifications || { notifications: [], settings: {} },
      finance: state.finance || null,
      theme: state.theme || { mode: 'system', colors: {}, settings: {} },
      // ✅ pomodoro رو نادیده بگیر (state موقت)
      _persist: state._persist || { version: 1, rehydrated: false }
    }
  },

  // ═══════════════════════════════════════════════
  // Version 1 → 2: اصلاح finance اگر ناقصه
  // ═══════════════════════════════════════════════
  2: (state) => {
    if (!state) return state

    console.log('🔄 Migrating from v1 to v2...')

    // ✅ اطمینان از اینکه finance state کامل هست
    if (state.finance) {
      state.finance = {
        accounts: state.finance.accounts || [],
        transactions: state.finance.transactions || [],
        plans: state.finance.plans || [],
        planDues: state.finance.planDues || [],
        budgets: state.finance.budgets || [],
        categories: state.finance.categories || { income: [], expense: [] },
        islamicSettings: state.finance.islamicSettings || {},
        currencySettings: state.finance.currencySettings || {},
        settings: state.finance.settings || {},
        loading: false,
        error: null
      }
    }

    return state
  },
  3: (state) => {
    if (!state) return state
    console.log('🔄 Migrating to v3 (auth)...')
    return {
      ...state,
      auth: state.auth || {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isCheckingAuth: true,
        error: null,
        initialized: false
      }
    }
  },
  4: (state) => {
  if (!state) return state
  console.log('🔄 Migrating to v4 (sync)...')
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
}
}

// ✅ نسخه فعلی
export const CURRENT_VERSION = 4