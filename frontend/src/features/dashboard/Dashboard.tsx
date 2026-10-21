import React, { useMemo, useCallback, memo, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSettings,
  FiCheck,
  FiRefreshCw,
  FiEyeOff,
  FiPlus,
  FiEye,
  FiInfo,
  FiSun,
  FiMoon,
  FiCalendar,
  FiAlertTriangle,
} from 'react-icons/fi'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import WidgetWrapper from './WidgetWrapper'
import WidgetErrorBoundary from './WidgetErrorBoundary'
import {
  toggleEditMode,
  toggleWidget,
  resetLayout,
  updateLayout,
  healLayout,
  WIDGETS,
} from './dashboardSlice'
import type { DashboardState, WidgetConfig } from './dashboardSlice'
import type { RootState, AppDispatch } from '../../app/store'
import { formatDateByLang } from '../../utils/formatters'

// ✅ ویجت‌ها
import StatsWidget from './widgets/StatsWidget'
import TodayTasksWidget from './widgets/TodayTasksWidget'
import QuickActionsWidget from './widgets/QuickActionsWidget'
import PomodoroStatsWidget from './widgets/PomodoroStatsWidget'
import RecentTasksWidget from './widgets/RecentTasksWidget'
import UpcomingDeadlinesWidget from './widgets/UpcomingDeadlinesWidget'
import TagsWidget from './widgets/TagsWidget'
import ProjectProgressWidget from './widgets/ProjectProgressWidget'
import ProductivityWidget from './widgets/ProductivityWidget'
import ProductivityScoreWidget from './widgets/ProductivityScoreWidget'
import NotesWidget from '../notes/NotesWidget'
import BalanceWidget from '../finance/BalanceWidget.tsx'
import MonthlyBudgetWidget from '../finance/MonthlyBudgetWidget'
import KhumsWidget from '../finance/KhumsWidget'
import RecentTransactionsWidget from '../finance/RecentTransactionsWidget'

const ResponsiveGridLayout = WidthProvider(Responsive)

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  productivityScore: ProductivityScoreWidget,
  stats: StatsWidget,
  todayTasks: TodayTasksWidget,
  quickActions: QuickActionsWidget,
  pomodoro: PomodoroStatsWidget,
  recentTasks: RecentTasksWidget,
  upcomingDeadlines: UpcomingDeadlinesWidget,
  notes: NotesWidget,
  projectProgress: ProjectProgressWidget,
  productivity: ProductivityWidget,
  tags: TagsWidget,
  financeBalance: BalanceWidget,
  monthlyBudget: MonthlyBudgetWidget,
  khums: KhumsWidget,
  recentTransactions: RecentTransactionsWidget,
}

// ═══════════════════════════════════════════════
// ✅ هدر خوش‌آمدگویی
// ═══════════════════════════════════════════════
const WelcomeHeader = memo(() => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting(isPersian ? 'صبح بخیر' : 'Good Morning')
    else if (hour < 18) setGreeting(isPersian ? 'عصر بخیر' : 'Good Afternoon')
    else setGreeting(isPersian ? 'شب بخیر' : 'Good Evening')
  }, [isPersian])

  const today = new Date()
  const dateStr = formatDateByLang(today.toISOString().split('T')[0])
  const dayName = today.toLocaleDateString(isPersian ? 'fa-IR' : 'en-US', {
    weekday: 'long',
  })

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-primary-500/20">
      <div className="absolute top-0 end-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            {new Date().getHours() < 18 ? (
              <FiSun size={24} className="text-yellow-300" />
            ) : (
              <FiMoon size={24} className="text-blue-200" />
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {greeting}
            </h1>
            <p className="text-primary-100 mt-0.5 flex items-center gap-1.5 text-xs">
              <FiCalendar size={12} /> {dayName} ، {dateStr}
            </p>
          </div>
        </div>
        <Button
          className="!bg-white !text-primary-700 hover:!bg-gray-50 shadow-lg border-0 group"
          size="small"
        >
          <FiPlus
            size={16}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          <span>{t('tasks.new')}</span>
        </Button>
      </div>
    </div>
  )
})
WelcomeHeader.displayName = 'WelcomeHeader'

// ═══════════════════════════════════════════════
// ✅ اسکلت لودینگ
// ═══════════════════════════════════════════════
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton variant="rounded" width="100%" height={120} />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rounded" className="h-56" />
      ))}
    </div>
  </div>
)

// ═══════════════════════════════════════════════
// ✅ Dashboard
// ═══════════════════════════════════════════════
const Dashboard = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const dashboard = useSelector((s: RootState) => s.dashboard) as
    | DashboardState
    | undefined
  const layout = dashboard?.layout ?? []
  const editMode = dashboard?.editMode ?? false

  // ✅ یک‌بار در mount، layout را سانیتایز/مهاجرت کن
  useEffect(() => {
    dispatch(healLayout())
  }, [dispatch])

  // ✅ state محلی برای دیالوگ ریست
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const { visibleWidgets, hiddenWidgets, rglLayout } = useMemo(() => {
    const safeNum = (n: unknown, fallback: number) => {
      const x = Number(n)
      return Number.isFinite(x) ? x : fallback
    }

    const visible = layout
      .filter(
        (w: WidgetConfig) =>
          w.visible && WIDGETS[w.id] && WIDGET_COMPONENTS[w.id]
      )
      .map((w: WidgetConfig) => ({
        ...w,
        x: Math.max(0, safeNum(w.x, 0)),
        y: Math.max(0, safeNum(w.y, 0)),
        w: Math.max(1, safeNum(w.w, 1)),
        h: Math.max(1, safeNum(w.h, 2)),
      }))

    return {
      visibleWidgets: visible,
      hiddenWidgets: layout.filter((w: WidgetConfig) => !w.visible),
      rglLayout: visible.map((w: WidgetConfig) => ({
        i: w.id,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
        minW: w.minW ?? 1,
        minH: w.minH ?? 2,
      })),
    }
  }, [layout])

  // ✅ باز کردن دیالوگ (نه window.confirm)
  const handleOpenReset = useCallback(() => {
    setShowResetConfirm(true)
  }, [])

  // ✅ ریست واقعی
 const handleConfirmReset = useCallback(() => {
  dispatch(resetLayout())
  setShowResetConfirm(false)
}, [dispatch])

  const handleCancelReset = useCallback(() => {
    setShowResetConfirm(false)
  }, [])

  // ✅ فقط تغییرات واقعی را dispatch کن
  const handleLayoutChange = useCallback(
    (current: Array<{ i: string; x: number; y: number; w: number; h: number }>) => {
      if (!Array.isArray(current) || current.length === 0) return

      const changed = current.some((item) => {
        const w = layout.find((x) => x.id === item.i)
        if (!w) return false
        return (
          w.x !== item.x ||
          w.y !== item.y ||
          w.w !== item.w ||
          w.h !== item.h
        )
      })

      if (!changed) return
      dispatch(updateLayout(current))
    },
    [dispatch, layout]
  )

  if (!dashboard || layout.length === 0) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <WelcomeHeader />

      {/* ═══ نوار ابزار ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </h2>
          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-full">
            {visibleWidgets.length} / {layout.length}
          </span>
        </div>
        <div className="flex gap-2">
          <AnimatePresence mode="wait">
            {editMode ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-2"
              >
                <Button
                  variant="danger"
                  onClick={handleOpenReset}
                  size="small"
                >
                  <FiRefreshCw size={14} />
                  <span>{t('actions.reset')}</span>
                </Button>
                <Button
                  onClick={() => dispatch(toggleEditMode())}
                  size="small"
                >
                  <FiCheck size={14} />
                  <span>{t('dashboard.saveLayout')}</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  variant="secondary"
                  onClick={() => dispatch(toggleEditMode())}
                  size="small"
                >
                  <FiSettings size={14} />
                  <span>{t('dashboard.customize')}</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ راهنمای حالت ویرایش ═══ */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <FiInfo
                  size={16}
                  className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  از هدر هر ویجت برای <strong>جابه‌جایی</strong> و از گوشه‌ها و
                  لبه‌های آن برای <strong>تغییر اندازه</strong> استفاده کنید.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ گرید ویجت‌ها ═══ */}
      {visibleWidgets.length > 0 ? (
<ResponsiveGridLayout
  key={`grid-v${dashboard.layoutVersion}-r${dashboard.lastResetAt}`}
  className="layout"
  layouts={{
    lg: rglLayout,
    md: rglLayout,
    sm: rglLayout,
    xs: rglLayout,
    xxs: rglLayout,
  }}
  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
  cols={{ lg: 4, md: 4, sm: 2, xs: 1, xxs: 1 }}
  rowHeight={90}
  margin={[16, 16]}
  containerPadding={[0, 0]}
  isDraggable={editMode}
  isResizable={editMode}
  draggableHandle=".drag-handle"
  resizeHandles={['se', 'sw', 'ne', 'nw', 's', 'e', 'w', 'n']}
  compactType="vertical"
  preventCollision={false}
  allowOverlap={false}
  onLayoutChange={handleLayoutChange}
  isBounded={false}
  useCSSTransforms
>
          {visibleWidgets.map((widget: WidgetConfig) => {
            const meta = WIDGETS[widget.id]
            const Comp = WIDGET_COMPONENTS[widget.id]
            if (!meta || !Comp) return <div key={widget.id} />

            return (
              <div key={widget.id} className="min-w-0">
                <WidgetWrapper
                  id={widget.id}
                  title={t(meta.titleKey)}
                  isEditMode={editMode}
                  onHide={() => dispatch(toggleWidget(widget.id))}
                >
                  <WidgetErrorBoundary widgetName={widget.id}>
                    <Comp />
                  </WidgetErrorBoundary>
                </WidgetWrapper>
              </div>
            )
          })}
        </ResponsiveGridLayout>
      ) : (
        <Card className="p-10 text-center bg-gray-50 dark:bg-gray-800/50 border-dashed border-2">
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
            <FiEyeOff size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {t('dashboard.noWidgets')}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            همه ویجت‌ها مخفی شده‌اند. از تنظیمات دوباره فعال کنید.
          </p>
          <Button onClick={() => dispatch(toggleEditMode())} className="mt-3">
            <FiEye size={14} />
            <span>{t('dashboard.customize')}</span>
          </Button>
        </Card>
      )}

      {/* ═══ ویجت‌های مخفی ═══ */}
      <AnimatePresence>
        {editMode && hiddenWidgets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border-dashed">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                <FiEyeOff size={14} />
                <span>{t('dashboard.hiddenWidgets')}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {hiddenWidgets.map((widget: WidgetConfig) => {
                  const info = WIDGETS[widget.id]
                  if (!info) return null
                  return (
                    <motion.button
                      key={widget.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => dispatch(toggleWidget(widget.id))}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-xs shadow-sm"
                    >
                      <FiPlus size={12} className="text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t(info.titleKey)}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ دیالوگ ریست چیدمان ═══ */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={handleCancelReset}
        onConfirm={handleConfirmReset}
        title={
          isPersian ? 'بازنشانی چیدمان داشبورد' : 'Reset Dashboard Layout'
        }
        message={
          <div className="space-y-3 text-start">
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <FiAlertTriangle
                size={20}
                className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  {isPersian
                    ? 'این کار قابل بازگشت نیست'
                    : 'This cannot be undone'}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {isPersian
                    ? 'تمام تغییرات چیدمان فعلی شما (جابه‌جایی، اندازه، ویجت‌های مخفی) از بین می‌رود و چیدمان به حالت پیش‌فرض زیبا بازمی‌گردد.'
                    : 'All your current layout changes (positions, sizes, hidden widgets) will be lost and the layout will return to the beautiful default.'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {isPersian
                  ? 'چیدمان پیش‌فرض شامل: نوار KPI، نمره بهره‌وری، کارهای امروز، نمودار روند، اقدامات سریع، پومودورو، ددلاین‌ها، کارهای اخیر، پروژه‌ها، یادداشت‌ها، مالی و تراکنش‌ها است.'
                  : 'The default layout includes: KPI bar, productivity score, today tasks, trend chart, quick actions, pomodoro, deadlines, recent tasks, projects, notes, finance, and transactions.'}
              </p>
            </div>
          </div>
        }
        confirmText={isPersian ? 'بله، بازنشانی کن' : 'Yes, Reset Layout'}
        cancelText={isPersian ? 'انصراف' : 'Cancel'}
        variant="danger"
      />
    </div>
  )
}

export default memo(Dashboard)