import React, { useEffect, lazy, Suspense, useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from './app/store'

// ─── Auth & Services ───
import { checkAuth, selectIsAuthenticated } from './features/auth/authSlice'
import { generateRecurringTasks } from './features/tasks/tasksSlice'
import { recalculateBalances } from './features/finance/financeSlice'
import { syncService } from './services/syncService'

// ─── Theme ───
import { ThemeEffects } from './features/theme/ThemeSettings'
import { initializeTheme } from './features/theme/themeSlice'

// ─── Core ───
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './features/auth/ProtectedRoute'
import InstallPrompt from './components/common/InstallPrompt'
import GlobalSearch from './components/common/GlobalSearch'
import QuickAddTask from './components/ui/QuickAddTask'

// ─── Layout (eager) ───
import AppLayout from './components/layout/AppLayout'

// ─── Skeletons ───
import AnalyticsSkeleton from './features/analytics/AnalyticsSkeleton'
import FinanceReportsSkeleton from './features/finance/FinanceReportsSkeleton'

// ─── Hook ───
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'

// ─── Pages (lazy) ───
const LoginPage = lazy(() => import('./features/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage'))
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const ProjectsPage = lazy(() => import('./features/projects/ProjectsPage'))
const TasksPage = lazy(() => import('./features/tasks/TasksPage'))
const HabitsPage = lazy(() => import('./features/habits/HabitsPage'))
const NotesPage = lazy(() => import('./features/notes/NotesPage'))
const GoalsPage = lazy(() => import('./features/goals/GoalsPage'))
const GrowthPage = lazy(() => import('./features/growth/GrowthPage'))
const PlanningPage = lazy(() => import('./features/planning/PlanningPage'))
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage'))
const AchievementsPage = lazy(() => import('./features/achievements/AchievementsPage'))
const FinancePage = lazy(() => import('./features/finance/FinancePage'))
const RewardsPage = lazy(() => import('./features/rewards/RewardsPage'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const NotificationsPage = lazy(() => import('./features/notifications/NotificationsPage'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

const WithSkeleton: React.FC<{
  skeleton: React.ReactNode
  children: React.ReactNode
}> = ({ skeleton, children }) => <Suspense fallback={skeleton}>{children}</Suspense>

function AppContent() {
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [showSearch, setShowSearch] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  // ✅ Bootstrap: theme + auth + recurring
  useEffect(() => {
    initializeTheme()
    dispatch(checkAuth())
    dispatch(generateRecurringTasks())
  }, [dispatch])

  // ✅ بازمحاسبه‌ی موجودی‌ها + بازمحاسبه بعد از هر sync
  useEffect(() => {
    dispatch(recalculateBalances())
    const unsubscribe = syncService.subscribe((event) => {
      if (event?.status === 'synced') dispatch(recalculateBalances())
    })
    return unsubscribe
  }, [dispatch])

  // ✅ شروع/توقف سینک
  useEffect(() => {
    if (isAuthenticated) syncService.start()
    else syncService.stop()
    return () => {
      syncService.stop()
    }
  }, [isAuthenticated])

  // ✅ میان‌برها
  const handleOpenSearch = useCallback(() => setShowSearch(true), [])
  const handleOpenQuickAdd = useCallback(() => setShowQuickAdd(true), [])

  useKeyboardShortcuts({
    onOpenSearch: handleOpenSearch,
    onOpenQuickAdd: handleOpenQuickAdd,
  })

  return (
    <>
      <ThemeEffects />

      {/* ═══ Suspense بیرونی — فقط برای صفحات public (login/forgot/reset) ═══ */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ═══ Public (بدون layout) ═══ */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ═══ Protected — همه داخل AppLayout ═══ */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout
                  onOpenSearch={handleOpenSearch}
                  onOpenQuickAdd={handleOpenQuickAdd}
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="growth" element={<GrowthPage />} />
            <Route path="planning" element={<PlanningPage />} />

            <Route
              path="analytics"
              element={
                <WithSkeleton skeleton={<AnalyticsSkeleton />}>
                  <AnalyticsPage />
                </WithSkeleton>
              }
            />

            <Route path="achievements" element={<AchievementsPage />} />

            <Route
              path="finance"
              element={
                <WithSkeleton skeleton={<FinanceReportsSkeleton />}>
                  <FinancePage />
                </WithSkeleton>
              }
            />

            <Route path="rewards" element={<RewardsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <InstallPrompt />

      {/* ═══ مودال‌های سراسری — فقط بعد از auth ═══ */}
      {isAuthenticated && (
        <>
          <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
          <QuickAddTask isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
        </>
      )}
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}