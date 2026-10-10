import React, { useEffect, useState, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import store from './app/store'
import AppLayout from './components/layout/AppLayout'
import OfflineIndicator from './components/common/OfflineIndicator'
import ErrorBoundary from './components/common/ErrorBoundary'
import GlobalSearch from './components/common/GlobalSearch'
import QuickAddTask from './components/ui/QuickAddTask'
import FloatingQuickAdd from './components/ui/FloatingQuickAdd'
import LoadingSpinner from './components/common/LoadingSpinner'
import PomodoroWidget from './features/pomodoro/PomodoroWidget'
import AchievementNotification from './features/achievements/AchievementNotification'
import { reminderService } from './services/reminderService'
import { generateRecurringTasks } from './features/tasks/tasksSlice'
import { initializeTheme } from './features/theme/themeSlice'

import 'react-toastify/dist/ReactToastify.css'

const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const ProjectsPage = lazy(() => import('./features/projects/ProjectsPage'))
const TasksPage = lazy(() => import('./features/tasks/TasksPage'))
const HabitsPage = lazy(() => import('./features/habits/HabitsPage'))
const NotesPage = lazy(() => import('./features/notes/NotesPage'))
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage'))
const PlanningPage = lazy(() => import('./features/planning/PlanningPage'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const AchievementsPage = lazy(() => import('./features/achievements/AchievementsPage'))

function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        صفحه پیدا نشد
      </h1>
      <a href="/" className="text-blue-600 hover:underline">
        بازگشت به داشبورد
      </a>
    </div>
  )
}

function AppContent() {
  const dispatch = useDispatch()
  const location = useLocation()
  const [showSearch, setShowSearch] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  useEffect(() => {
    initializeTheme()
  }, [])

  useEffect(() => {
    if (reminderService.started) return
    try {
      reminderService.start()
    } catch (error) {
      console.error('Error starting reminder service:', error)
    }
  }, [])

  useEffect(() => {
    dispatch(generateRecurringTasks())
    const interval = setInterval(() => {
      dispatch(generateRecurringTasks())
    }, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [dispatch])

  // ✅ وقتی کاربر وارد TasksPage میشه، زمان بازدید رو ذخیره کن
  useEffect(() => {
    if (location.pathname === '/tasks') {
      localStorage.setItem('smart-planner-tasks-viewed-at', new Date().toISOString())
    }
  }, [location.pathname])

  // ✅ شورتکات‌های کیبورد (با e.code برای پشتیبانی کامل)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target
      const tagName = target?.tagName?.toLowerCase()
      const isContentEditable = target?.isContentEditable
      const isInInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isContentEditable

      // Ctrl+K یا Cmd+K → جستجو
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
        e.preventDefault()
        setShowSearch(prev => !prev)
        return
      }

      if (isInInput) return

      // "/" → جستجو
      if (e.code === 'Slash') {
        e.preventDefault()
        setShowSearch(true)
        return
      }

      // "N" → Quick Add (با e.code)
      if (e.code === 'KeyN' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setShowQuickAdd(true)
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <React.Fragment>
      <AppLayout 
        onOpenSearch={() => setShowSearch(true)}
        onOpenQuickAdd={() => setShowQuickAdd(true)}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="large" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/planning" element={<PlanningPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppLayout>

      <GlobalSearch 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />

      <QuickAddTask 
        isOpen={showQuickAdd} 
        onClose={() => setShowQuickAdd(false)} 
      />

      <FloatingQuickAdd onClick={() => setShowQuickAdd(true)} />

      <PomodoroWidget />
      <AchievementNotification />
      <OfflineIndicator />

      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ direction: 'rtl' }}
      />
    </React.Fragment>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <AppContent />
        </Router>
      </Provider>
    </ErrorBoundary>
  )
}

export default App