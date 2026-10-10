import React, { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileBottomNav from './MobileBottomNav'

const AppLayout = ({ children, onOpenSearch, onOpenQuickAdd }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <Header 
          onOpenSearch={onOpenSearch} 
          onOpenQuickAdd={onOpenQuickAdd}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
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
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="md:hidden fixed top-16 bottom-0 end-0 z-50 animate-slide-in">
              <Sidebar onItemClick={() => setSidebarOpen(false)} />
            </div>
          </>
        )}
        
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-20 md:pb-0">
          <div className="p-4 md:p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav onOpenQuickAdd={onOpenQuickAdd} />
    </div>
  )
}

export default AppLayout