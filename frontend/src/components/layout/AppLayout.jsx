import React, { useState, useCallback, memo } from 'react'
import { Outlet } from 'react-router-dom' // ✅ اضافه شد
import Header from './Header'
import Sidebar from './Sidebar'
import MobileBottomNav from './MobileBottomNav'

// ✅ children رو برداشتیم چون دیگه لازم نیست
const AppLayout = memo(({ onOpenSearch, onOpenQuickAdd }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <Header 
          onOpenSearch={onOpenSearch} 
          onOpenQuickAdd={onOpenQuickAdd}
          onToggleSidebar={toggleSidebar}
        />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block flex-shrink-0 border-e border-gray-200 dark:border-gray-700">
          <Sidebar />
        </div>

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
        
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-20 md:pb-0">
          <div className="p-4 md:p-6 min-h-full">
            {/* ✅ اینجا جایی است که صفحات لود می‌شوند */}
            <Outlet /> 
          </div>
        </main>
      </div>

      <MobileBottomNav onOpenQuickAdd={onOpenQuickAdd} />
    </div>
  )
})
AppLayout.displayName = 'AppLayout'

export default AppLayout