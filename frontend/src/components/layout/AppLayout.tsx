import React, { useState, useCallback, memo, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileBottomNav from './MobileBottomNav'

interface AppLayoutProps {
  onOpenSearch: () => void
  onOpenQuickAdd: () => void
}

// ✅ فقط محتوای صفحه — نه Sidebar/Header
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

const AppLayout = memo(({ onOpenSearch, onOpenQuickAdd }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Header — ثابت، بدون remount */}
      <div className="flex-shrink-0">
        <Header
          onOpenSearch={onOpenSearch}
          onOpenQuickAdd={onOpenQuickAdd}
          onToggleSidebar={toggleSidebar}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar دسکتاپ — ثابت */}
        <div className="hidden md:block flex-shrink-0 border-e border-gray-200 dark:border-gray-700">
          <Sidebar />
        </div>

        {/* Sidebar موبایل */}
        {sidebarOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
              onClick={closeSidebar}
            />
            <div className="md:hidden fixed top-16 bottom-0 end-0 z-50 animate-slide-in">
              <Sidebar onItemClick={closeSidebar} />
            </div>
          </>
        )}

        {/* Main — فقط اینجا عوض می‌شود */}
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-20 md:pb-0">
          <div className="p-4 md:p-6 min-h-full">
            {/* ✅ Suspense داخل AppLayout — تا lazy load صفحات AppLayout را unmount نکند */}
            <Suspense fallback={<PageLoading />}>
              {/* ✅ AnimatePresence فقط دور Outlet */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </div>
        </main>
      </div>

      <MobileBottomNav onOpenQuickAdd={onOpenQuickAdd} />
    </div>
  )
})
AppLayout.displayName = 'AppLayout'

export default AppLayout