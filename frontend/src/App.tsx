import React, { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from './app/store' // ✅ اضافه شد برای رفع خطای TS
import { checkAuth, selectIsAuthenticated } from './features/auth/authSlice'
import { generateRecurringTasks } from './features/tasks/tasksSlice'
import { ThemeEffects } from './features/theme/ThemeSettings'
import { syncService } from './services/syncService'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './features/auth/ProtectedRoute'
import { initializeTheme } from './features/theme/themeSlice'

// ✅ Lazy load همه‌ی صفحات
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
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const AppLayout = lazy(() => import('./components/layout/AppLayout'))

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

function AppContent() {
  // ✅ استفاده از AppDispatch برای رفع خطای AsyncThunkAction
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // ✅ Bootstrap: check auth + theme + recurring tasks
  useEffect(() => {
    initializeTheme()
    dispatch(checkAuth())
    dispatch(generateRecurringTasks())
  }, [dispatch])

  // ✅ Start/stop sync service based on auth
  useEffect(() => {
    if (isAuthenticated) {
      syncService.start()
    } else {
      syncService.stop()
    }
    return () => { 
      syncService.stop() 
    }
  }, [isAuthenticated])

  return (
    <>
      <ThemeEffects />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
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
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <AppContent />
      </Suspense>
    </ErrorBoundary>
  )
}