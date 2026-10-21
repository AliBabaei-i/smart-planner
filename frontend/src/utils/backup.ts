import { store } from '../app/store'

export const BACKUP_VERSION = '3.0'
export const APP_VERSION = '2.1.0'
const HISTORY_KEY = 'smart-planner-backup-history'
const MAX_HISTORY = 5

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

// ✅ لیست sliceهایی که باید پشتیبان گرفته شوند
const BACKUP_SLICES = [
  'tasks', 'projects', 'habits', 'notes', 'goals', 'growth',
  'finance', 'dashboard', 'achievements', 'theme', 'notifications',
] as const

// ═══════════════════════════════════════════════
// ✅ Export
// ═══════════════════════════════════════════════
export const createBackup = (): BackupData => {
  const state = store.getState() as any
  const data: Record<string, any> = {}
  const counts: Record<string, number> = {}

  for (const slice of BACKUP_SLICES) {
    if (state[slice] !== undefined) {
      data[slice] = state[slice]
      // آمار ساده
      const s = state[slice]
      if (Array.isArray(s?.tasks)) counts.tasks = s.tasks.length
      else if (Array.isArray(s?.projects)) counts.projects = s.projects.length
      else if (Array.isArray(s?.habits)) counts.habits = s.habits.length
      else if (Array.isArray(s?.notes)) counts.notes = s.notes.length
      else if (Array.isArray(s?.goals)) counts.goals = s.goals.length
      else if (Array.isArray(s?.transactions)) counts.transactions = s.transactions.length
      else if (Array.isArray(s?.accounts)) counts.accounts = s.accounts.length
    }
  }

  return {
    _meta: {
      version: BACKUP_VERSION,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      locale: (state.theme?.language as string) || 'fa',
      counts,
    },
    data,
  }
}

export const downloadBackup = (): { success: boolean; message: string; filename?: string } => {
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

    // ذخیره در تاریخچه (فقط متادیتا)
    saveToHistory(backup._meta, filename)

    return {
      success: true,
      message: `پشتیبان دانلود شد (${filename})`,
      filename,
    }
  } catch (err: any) {
    return { success: false, message: `خطا: ${err.message}` }
  }
}

// ═══════════════════════════════════════════════
// ✅ Import
// ═══════════════════════════════════════════════
export const validateBackup = (parsed: any): { valid: boolean; error?: string } => {
  if (!parsed || typeof parsed !== 'object') return { valid: false, error: 'فرمت JSON نامعتبر' }
  if (!parsed._meta || typeof parsed._meta !== 'object') return { valid: false, error: 'متادیتا ندارد' }
  if (!parsed._meta.version) return { valid: false, error: 'نسخه مشخص نیست' }
  if (!parsed.data || typeof parsed.data !== 'object') return { valid: false, error: 'داده ندارد' }

  const majorVersion = String(parsed._meta.version).split('.')[0]
  const currentMajor = BACKUP_VERSION.split('.')[0]
  if (majorVersion !== currentMajor) {
    return {
      valid: false,
      error: `نسخه‌ی فایل (${parsed._meta.version}) با نسخه‌ی فعلی (${BACKUP_VERSION}) سازگار نیست`,
    }
  }

  return { valid: true }
}

export interface ImportResult {
  success: boolean
  message: string
  restoredSlices: string[]
}

export const importBackup = async (
  file: File,
  options: { merge?: boolean } = {}
): Promise<ImportResult> => {
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const validation = validateBackup(parsed)
    if (!validation.valid) {
      return { success: false, message: validation.error || 'فایل نامعتبر', restoredSlices: [] }
    }

    const restoredSlices: string[] = []
    const data = parsed.data

    // ✅ import با اکشن‌های مربوطه
    if (data.tasks?.tasks && Array.isArray(data.tasks.tasks)) {
      store.dispatch({ type: 'tasks/__restore__', payload: data.tasks })
      restoredSlices.push('tasks')
    }
    if (data.projects?.projects) {
      store.dispatch({ type: 'projects/__restore__', payload: data.projects })
      restoredSlices.push('projects')
    }
    if (data.habits?.habits) {
      store.dispatch({ type: 'habits/__restore__', payload: data.habits })
      restoredSlices.push('habits')
    }
    if (data.notes?.notes) {
      store.dispatch({ type: 'notes/__restore__', payload: data.notes })
      restoredSlices.push('notes')
    }
    if (data.goals?.goals) {
      store.dispatch({ type: 'goals/__restore__', payload: data.goals })
      restoredSlices.push('goals')
    }
    if (data.finance?.accounts) {
      store.dispatch({
        type: 'finance/importFinanceData',
        payload: {
          accounts: data.finance.accounts,
          transactions: data.finance.transactions,
          plans: data.finance.plans,
          planDues: data.finance.planDues,
          budgets: data.finance.budgets,
          categories: data.finance.categories,
          islamicSettings: data.finance.islamicSettings,
          currencySettings: data.finance.currencySettings,
        },
      })
      restoredSlices.push('finance')
    }
    if (data.notifications?.notifications) {
      store.dispatch({ type: 'notifications/__restore__', payload: data.notifications })
      restoredSlices.push('notifications')
    }

    return {
      success: true,
      message: `${restoredSlices.length} بخش با موفقیت بازیابی شد. صفحه بارگذاری می‌شود...`,
      restoredSlices,
    }
  } catch (err: any) {
    return { success: false, message: `خطا در خواندن فایل: ${err.message}`, restoredSlices: [] }
  }
}

// ═══════════════════════════════════════════════
// ✅ History
// ═══════════════════════════════════════════════
interface HistoryItem {
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
  } catch {
    // بی‌صدا شکست می‌خورد
  }
}

export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {}
}