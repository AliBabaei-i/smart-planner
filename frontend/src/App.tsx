import React, { useEffect, lazy, Suspense, useState, useCallback } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence } from 'framer-motion'
import type { AppDispatch } from './app/store'

// ─── Auth & Services ───
import { checkAuth, selectIsAuthenticated } from './features/auth/authSlice'
import { generateRecurringTasks } from './features/tasks/tasksSlice'
import { recalculateBalances } from './features/finance/financeSlice'
import { syncService } from './services/syncService'

// ─── Theme ───
import { ThemeEffects } from './features/theme/ThemeSettings'
import { initializeTheme } from './features/theme/themeSlice'

// ─── Core Components ───
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './features/auth/ProtectedRoute'
import InstallPrompt from './components/common/InstallPrompt'
import PageTransition from './components/common/PageTransition'
import GlobalSearch from './components/common/GlobalSearch'
import QuickAddTask from './components/ui/QuickAddTask'

// ─── Layout (eager، نه lazy) ───
import AppLayout from './components/layout/AppLayout'

// ─── Skeletons ───
import AnalyticsSkeleton from './features/analytics/AnalyticsSkeleton'
import FinanceReportsSkeleton from './features/finance/FinanceReportsSkeleton'

// ─── Hooks ───
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import NotificationsPage from './features/notifications/NotificationsPage'

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

// ─── Fallback ───
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

// ─── Helper: Suspense با اسکلت اختصاصی ───
const WithSkeleton: React.FC<{
  skeleton: React.ReactNode
  children: React.ReactNode
}> = ({ skeleton, children }) => <Suspense fallback={skeleton}>{children}</Suspense>

// ═══════════════════════════════════════════════
// AppContent
// ═══════════════════════════════════════════════
function AppContent() {
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()

  const [showSearch, setShowSearch] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  // ✅ Bootstrap: theme + auth + recurring
  useEffect(() => {
    initializeTheme()
    dispatch(checkAuth())
    dispatch(generateRecurringTasks())
  }, [dispatch])

  // ✅ بازمحاسبه‌ی موجودی‌ها بعد از persist
  useEffect(() => {
    // یک‌بار در startup
    dispatch(recalculateBalances())

    // بعد از هر sync موفق
    const unsubscribe = syncService.subscribe((event: any) => {
      if (event?.status === 'synced') {
        dispatch(recalculateBalances())
      }
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

  // ✅ کلیدهای میان‌بر
  const handleOpenSearch = useCallback(() => setShowSearch(true), [])
  const handleOpenQuickAdd = useCallback(() => setShowQuickAdd(true), [])

  useKeyboardShortcuts({
    onOpenSearch: handleOpenSearch,
    onOpenQuickAdd: handleOpenQuickAdd,
  })

  return (
    <>
      <ThemeEffects />

      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* ─── Public ─── */}
            <Route
              path="/login"
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PageTransition>
                  <ForgotPasswordPage />
                </PageTransition>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PageTransition>
                  <ResetPasswordPage />
                </PageTransition>
              }
            />

            {/* ─── Protected ─── */}
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
              <Route
                index
                element={
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                }
              />
              <Route
                path="projects"
                element={
                  <PageTransition>
                    <ProjectsPage />
                  </PageTransition>
                }
              />
              <Route
                path="tasks"
                element={
                  <PageTransition>
                    <TasksPage />
                  </PageTransition>
                }
              />
              <Route
                path="habits"
                element={
                  <PageTransition>
                    <HabitsPage />
                  </PageTransition>
                }
              />
              <Route
                path="notes"
                element={
                  <PageTransition>
                    <NotesPage />
                  </PageTransition>
                }
              />
              <Route
                path="goals"
                element={
                  <PageTransition>
                    <GoalsPage />
                  </PageTransition>
                }
              />
              <Route
                path="growth"
                element={
                  <PageTransition>
                    <GrowthPage />
                  </PageTransition>
                }
              />
              <Route
                path="planning"
                element={
                  <PageTransition>
                    <PlanningPage />
                  </PageTransition>
                }
              />

              {/* Analytics — اسکلت اختصاصی */}
              <Route
                path="analytics"
                element={
                  <PageTransition>
                    <WithSkeleton skeleton={<AnalyticsSkeleton />}>
                      <AnalyticsPage />
                    </WithSkeleton>
                  </PageTransition>
                }
              />

              <Route
                path="achievements"
                element={
                  <PageTransition>
                    <AchievementsPage />
                  </PageTransition>
                }
              />

              {/* Finance — اسکلت اختصاصی */}
              <Route
                path="finance"
                element={
                  <PageTransition>
                    <WithSkeleton skeleton={<FinanceReportsSkeleton />}>
                      <FinancePage />
                    </WithSkeleton>
                  </PageTransition>
                }
              />

              <Route
                path="rewards"
                element={
                  <PageTransition>
                    <RewardsPage />
                  </PageTransition>
                }
              />
              <Route
                path="settings"
                element={
                  <PageTransition>
                    <SettingsPage />
                  </PageTransition>
                }
              />
            </Route>
            <Route
              path="notifications"
              element={
                <PageTransition>
                  <NotificationsPage />
                </PageTransition>
              }
            />
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      <InstallPrompt />

      {/* ─── مودال‌های سراسری (بعد از auth) ─── */}
      {isAuthenticated && (
        <>
          <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
          <QuickAddTask isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
        </>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════
// App
// ═══════════════════════════════════════════════
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}