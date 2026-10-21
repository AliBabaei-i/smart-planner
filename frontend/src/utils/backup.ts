import { store } from '../app/store'

export const BACKUP_VERSION = '3.0'
export const APP_VERSION = '2.1.0'
const HISTORY_KEY = 'smart-planner-backup-history'
const MAX_HISTORY = 5

// ✅ sliceهایی که reducer __restore__ دارند (جایگزینی کامل state)
const RESTORE_SLICES = [
  'tasks',
  'projects',
  'habits',
  'notes',
  'goals',
  'growth',
  'notifications',
  'achievements',
  'dashboard',
  'theme',
] as const

// ✅ sliceهایی که import اختصاصی دارند
const SPECIAL_SLICES = ['finance'] as const

const ALL_SLICES = [...RESTORE_SLICES, ...SPECIAL_SLICES] as const

export interface BackupMeta {
  version: string
  appVersion: string
  exportedAt: string
  locale: string
  counts: Record<string, number>
}

export interface BackupData {
  _meta: BackupMeta
  data: Record<string, any>
}

// ═══════════════════════════════════════════════
// ✅ Export
// ═══════════════════════════════════════════════
export const createBackup = (): BackupData => {
  const state = store.getState() as any
  const data: Record<string, any> = {}
  const counts: Record<string, number> = {}

  for (const slice of ALL_SLICES) {
    if (state[slice] === undefined) continue
    const s = state[slice]
    data[slice] = s

    if (slice === 'tasks' && Array.isArray(s.tasks)) counts.tasks = s.tasks.length
    if (slice === 'projects' && Array.isArray(s.projects)) counts.projects = s.projects.length
    if (slice === 'habits' && Array.isArray(s.habits)) counts.habits = s.habits.length
    if (slice === 'notes' && Array.isArray(s.notes)) counts.notes = s.notes.length
    if (slice === 'goals' && Array.isArray(s.goals)) counts.goals = s.goals.length
    if (slice === 'growth') {
      counts.journals = (s.journals || []).length
      counts.skills = (s.skills || []).length
    }
    if (slice === 'notifications' && Array.isArray(s.notifications)) {
      counts.notifications = s.notifications.length
    }
    if (slice === 'finance') {
      counts.accounts = (s.accounts || []).length
      counts.transactions = (s.transactions || []).length
    }
  }

  return {
    _meta: {
      version: BACKUP_VERSION,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      locale: state.theme?.language || 'fa',
      counts,
    },
    data,
  }
}

export const downloadBackup = (): {
  success: boolean
  message: string
  filename?: string
} => {
  try {
    const backup = createBackup()
    const json = JSON.stringify(backup, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `smart-planner-backup-${timestamp}.json`

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    saveToHistory(backup._meta, filename)
    return { success: true, message: `پشتیبان دانلود شد (${filename})`, filename }
  } catch (err: any) {
    return { success: false, message: `خطا: ${err.message}` }
  }
}

// ═══════════════════════════════════════════════
// ✅ Validate
// ═══════════════════════════════════════════════
export const validateBackup = (
  parsed: any
): { valid: boolean; error?: string } => {
  if (!parsed || typeof parsed !== 'object')
    return { valid: false, error: 'فرمت JSON نامعتبر' }
  if (!parsed._meta || typeof parsed._meta !== 'object')
    return { valid: false, error: 'متادیتا ندارد' }
  if (!parsed._meta.version) return { valid: false, error: 'نسخه مشخص نیست' }
  if (!parsed.data || typeof parsed.data !== 'object')
    return { valid: false, error: 'داده ندارد' }

  const major = String(parsed._meta.version).split('.')[0]
  const currentMajor = BACKUP_VERSION.split('.')[0]
  if (major !== currentMajor) {
    return {
      valid: false,
      error: `نسخه‌ی فایل (${parsed._meta.version}) با نسخه‌ی فعلی (${BACKUP_VERSION}) سازگار نیست`,
    }
  }
  return { valid: true }
}

// ═══════════════════════════════════════════════
// ✅ Import
// ═══════════════════════════════════════════════
export interface ImportResult {
  success: boolean
  message: string
  restoredSlices: string[]
  warnings?: string[]
}

export const importBackup = async (file: File): Promise<ImportResult> => {
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const validation = validateBackup(parsed)
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'فایل نامعتبر',
        restoredSlices: [],
      }
    }

    const restoredSlices: string[] = []
    const warnings: string[] = []
    const data = parsed.data || {}

    // ✅ RESTORE_SLICES
    for (const slice of RESTORE_SLICES) {
      const sliceState = data[slice]
      if (!sliceState) continue
      try {
        store.dispatch({
          type: `${slice}/__restore__`,
          payload: sliceState,
        })
        restoredSlices.push(slice)
      } catch (err: any) {
        warnings.push(`${slice}: ${err.message}`)
      }
    }

    // ✅ Finance
    if (data.finance) {
      try {
        const f = data.finance
        store.dispatch({
          type: 'finance/importFinanceData',
          payload: {
            accounts: f.accounts,
            transactions: f.transactions,
            plans: f.plans,
            planDues: f.planDues,
            budgets: f.budgets,
            categories: f.categories,
            islamicSettings: f.islamicSettings,
            currencySettings: f.currencySettings,
            settings: f.settings,
          },
        })
        restoredSlices.push('finance')
      } catch (err: any) {
        warnings.push(`finance: ${err.message}`)
      }
    }

    return {
      success: restoredSlices.length > 0,
      message:
        restoredSlices.length > 0
          ? `${restoredSlices.length} بخش بازیابی شد. صفحه بارگذاری می‌شود...`
          : 'هیچ بخشی بازیابی نشد',
      restoredSlices,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  } catch (err: any) {
    return {
      success: false,
      message: `خطا در خواندن فایل: ${err.message}`,
      restoredSlices: [],
    }
  }
}

// ═══════════════════════════════════════════════
// ✅ History
// ═══════════════════════════════════════════════
export interface HistoryItem {
  filename: string
  exportedAt: string
  counts: Record<string, number>
}

export const getHistory = (): HistoryItem[] => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

const saveToHistory = (meta: BackupMeta, filename: string) => {
  try {
    const history = getHistory()
    history.unshift({
      filename,
      exportedAt: meta.exportedAt,
      counts: meta.counts,
    })
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)))
  } catch {}
}

export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {}
}