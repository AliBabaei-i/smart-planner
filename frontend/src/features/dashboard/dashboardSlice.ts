import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type WidgetSize = 'small' | 'medium' | 'large' | 'full'

export type WidgetId =
  | 'productivityScore' | 'stats' | 'todayTasks' | 'quickActions'
  | 'pomodoro' | 'recentTasks' | 'upcomingDeadlines' | 'notes'
  | 'projectProgress' | 'productivity' | 'tags'
  | 'financeBalance' | 'monthlyBudget' | 'khums' | 'recentTransactions' | 'aiSuggestions'

export interface WidgetMeta {
  titleKey: string
  minW?: number
  minH?: number
}

export interface WidgetConfig {
  id: WidgetId
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  visible: boolean
}

export interface DashboardState {
  layout: WidgetConfig[]
  editMode: boolean
  layoutVersion: number
  lastResetAt: number
}

// ✅ هر بار چیدمان پیش‌فرض را تغییر دادی، این عدد را یکی زیاد کن
export const CURRENT_LAYOUT_VERSION = 3

export const WIDGETS: Record<WidgetId, WidgetMeta> = {
  productivityScore: { titleKey: 'dashboard.widgets.productivityScore', minW: 1, minH: 3 },
  stats: { titleKey: 'dashboard.widgets.stats', minW: 2, minH: 1 },
  todayTasks: { titleKey: 'dashboard.widgets.todayTasks', minW: 1, minH: 3 },
  quickActions: { titleKey: 'dashboard.widgets.quickActions', minW: 1, minH: 2 },
  pomodoro: { titleKey: 'dashboard.widgets.pomodoro', minW: 1, minH: 2 },
  recentTasks: { titleKey: 'dashboard.widgets.recentTasks', minW: 1, minH: 2 },
  upcomingDeadlines: { titleKey: 'dashboard.widgets.upcomingDeadlines', minW: 1, minH: 2 },
  notes: { titleKey: 'dashboard.widgets.notes', minW: 1, minH: 2 },
  projectProgress: { titleKey: 'dashboard.widgets.projectProgress', minW: 1, minH: 2 },
  productivity: { titleKey: 'dashboard.widgets.productivity', minW: 1, minH: 2 },
  tags: { titleKey: 'dashboard.widgets.tags', minW: 1, minH: 2 },
  financeBalance: { titleKey: 'dashboard.widgets.financeBalance', minW: 1, minH: 2 },
  monthlyBudget: { titleKey: 'dashboard.widgets.monthlyBudget', minW: 1, minH: 2 },
  khums: { titleKey: 'dashboard.widgets.khums', minW: 1, minH: 2 },
  recentTransactions: { titleKey: 'dashboard.widgets.recentTransactions', minW: 1, minH: 2 },
  aiSuggestions: { titleKey: 'dashboard.widgets.aiSuggestions', minW: 1, minH: 2 },
}

// ═══════════════════════════════════════════════
// ✅ چیدمان پیش‌فرض زیبا — همه‌ی ۱۵ ویجت
// ═══════════════════════════════════════════════
export const BEAUTIFUL_DEFAULT_LAYOUT: WidgetConfig[] = [
  // ردیف ۱: KPI تمام‌عرض
  { id: 'stats', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 1, visible: true },
  { id: 'aiSuggestions', x: 3, y: 11, w: 1, h: 2, minW: 1, minH: 2, visible: true },
  // ردیف ۲-۴: ۳ ویجت اصلی
  { id: 'productivityScore', x: 0, y: 2, w: 1, h: 3, minW: 1, minH: 3, visible: true },
  { id: 'todayTasks', x: 1, y: 2, w: 1, h: 3, minW: 1, minH: 3, visible: true },
  { id: 'productivity', x: 2, y: 2, w: 2, h: 2, minW: 1, minH: 2, visible: true },

  // ردیف ۴-۵
  { id: 'quickActions', x: 2, y: 4, w: 1, h: 2, minW: 1, minH: 2, visible: true },
  { id: 'pomodoro', x: 3, y: 4, w: 1, h: 2, minW: 1, minH: 2, visible: true },
  { id: 'upcomingDeadlines', x: 0, y: 5, w: 1, h: 2, minW: 1, minH: 2, visible: true },
  { id: 'recentTasks', x: 1, y: 5, w: 1, h: 2, minW: 1, minH: 2, visible: true },

  // ردیف ۷-۸
  { id: 'projectProgress', x: 0, y: 7, w: 2, h: 2, minW: 1, minH: 2, visible: true },
  { id: 'notes', x: 2, y: 7, w: 2, h: 2, minW: 1, minH: 2, visible: true },

  // ردیف ۹-۱۰: مالی و برچسب
  { id: 'financeBalance', x: 0, y: 9, w: 1, h: 2, minW: 1, minH: 2, visible: true },
  { id: 'monthlyBudget', x: 1, y: 9, w: 1, h: 2, minW: 1, minH: 2, visible: true },
  { id: 'khums', x: 2, y: 9, w: 1, h: 2, minW: 1, minH: 2, visible: true },
  { id: 'tags', x: 3, y: 9, w: 1, h: 2, minW: 1, minH: 2, visible: true },

  // ردیف ۱۱: تمام‌عرض
  { id: 'recentTransactions', x: 0, y: 11, w: 4, h: 2, minW: 1, minH: 2, visible: true },
]

// ✅ کپی عمیق — هیچ‌وقت با آرایه‌ی اصلی share نمی‌شود
const cloneDefault = (): WidgetConfig[] =>
  BEAUTIFUL_DEFAULT_LAYOUT.map((w) => ({ ...w }))

// ✅ اعتبارسنجی
const sanitizeLayout = (layout: unknown): WidgetConfig[] => {
  if (!Array.isArray(layout) || layout.length === 0) return cloneDefault()

  const safe = layout.filter((w): w is WidgetConfig =>
    typeof w === 'object' && w !== null &&
    typeof (w as WidgetConfig).id === 'string' &&
    ((w as WidgetConfig).id in WIDGETS) &&
    Number.isFinite((w as WidgetConfig).x) &&
    Number.isFinite((w as WidgetConfig).y) &&
    Number.isFinite((w as WidgetConfig).w) &&
    Number.isFinite((w as WidgetConfig).h)
  )

  return safe.length === 0 ? cloneDefault() : safe
}

// ✅ اگر ویجتی در layout نبود، به آخر اضافه کن
const ensureAllWidgets = (layout: WidgetConfig[]): WidgetConfig[] => {
  const existing = new Set(layout.map((w) => w.id))
  const extras: WidgetConfig[] = []

  for (const id of Object.keys(WIDGETS) as WidgetId[]) {
    if (!existing.has(id)) {
      const meta = WIDGETS[id]
      extras.push({
        id,
        x: 0,
        y: 999,
        w: 2,
        h: 2,
        minW: meta.minW ?? 1,
        minH: meta.minH ?? 2,
        visible: true,
      })
    }
  }

  return extras.length === 0 ? layout : [...layout, ...extras]
}

const initialState: DashboardState = {
  layout: cloneDefault(),
  editMode: false,
  layoutVersion: CURRENT_LAYOUT_VERSION,
  lastResetAt: 0,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    toggleEditMode: (state) => {
      state.editMode = !state.editMode
    },

    toggleWidget: (state, action: PayloadAction<WidgetId>) => {
      const w = state.layout.find((x) => x.id === action.payload)
      if (w) w.visible = !w.visible
    },

    updateLayout: (
      state,
      action: PayloadAction<Array<{ i: string; x: number; y: number; w: number; h: number }>>
    ) => {
      for (const item of action.payload) {
        const widget = state.layout.find((w) => w.id === item.i)
        if (widget) {
          widget.x = Number(item.x) || 0
          widget.y = Number(item.y) || 0
          widget.w = Math.max(1, Number(item.w) || 1)
          widget.h = Math.max(1, Number(item.h) || 1)
        }
      }
    },

    // ✅ مهاجرت نسخه + سانیتایز
    healLayout: (state) => {
      if (state.layoutVersion !== CURRENT_LAYOUT_VERSION) {
        state.layout = cloneDefault()
        state.layoutVersion = CURRENT_LAYOUT_VERSION
        state.editMode = false
        state.lastResetAt = Date.now()
        return
      }
      const cleaned = sanitizeLayout(state.layout)
      state.layout = ensureAllWidgets(cleaned)
    },

    // ✅ ریست واقعی — همه‌ی ۱۵ ویجت + force remount گرید
    resetLayout: (state) => {
      state.layout = cloneDefault()
      state.editMode = false
      state.layoutVersion = CURRENT_LAYOUT_VERSION
      state.lastResetAt = Date.now()
    },
  },
})

export const {
  toggleEditMode,
  toggleWidget,
  updateLayout,
  healLayout,
  resetLayout,
} = dashboardSlice.actions

export default dashboardSlice.reducer