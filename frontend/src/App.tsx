import React, { useEffect, lazy, Suspense, useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from './app/store'
import { checkAuth, selectIsAuthenticated } from './features/auth/authSlice'
import { generateRecurringTasks } from './features/tasks/tasksSlice'
import { recalculateBalances } from './features/finance/financeSlice'
import { syncService } from './services/syncService'
import { ThemeEffects } from './features/theme/ThemeSettings'
import { initializeTheme } from './features/theme/themeSlice'

import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './features/auth/ProtectedRoute'
import InstallPrompt from './components/common/InstallPrompt'
import GlobalSearch from './components/common/GlobalSearch'
import QuickAddTask from './components/ui/QuickAddTask'
import AppLayout from './components/layout/AppLayout'
import AnalyticsSkeleton from './features/analytics/AnalyticsSkeleton'
import FinanceReportsSkeleton from './features/finance/FinanceReportsSkeleton'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'

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

  useEffect(() => {
    initializeTheme()
    dispatch(checkAuth())
    dispatch(generateRecurringTasks())
  }, [dispatch])

  useEffect(() => {
    dispatch(recalculateBalances())
    const unsubscribe = syncService.subscribe((event: any) => {
      if (event?.status === 'synced') dispatch(recalculateBalances())
    })
    return unsubscribe
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) syncService.start()
    else syncService.stop()
    return () => {
      syncService.stop()
    }
  }, [isAuthenticated])

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
        {/* ✅ بدون key و بدون AnimatePresence در این لایه */}
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected — AppLayout ثابت، فقط Outlet عوض می‌شود */}
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