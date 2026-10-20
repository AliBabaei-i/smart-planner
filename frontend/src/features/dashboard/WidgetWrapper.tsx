import React, { memo } from 'react'
import { FiEyeOff, FiMove } from 'react-icons/fi'
import Card from '../../components/ui/Card'

interface WidgetWrapperProps {
  id: string
  title: string
  isEditMode?: boolean
  onHide?: () => void
  children: React.ReactNode
}

const WidgetWrapper = memo(({ id, title, isEditMode, onHide, children }: WidgetWrapperProps) => {
  return (
    <Card
      className={`h-full flex flex-col min-w-0 overflow-hidden transition-all ${
        isEditMode ? 'ring-2 ring-blue-400/70 shadow-lg' : ''
      }`}
    >
      {isEditMode && (
        <div className="drag-handle cursor-move flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 min-w-0">
            <FiMove size={12} className="flex-shrink-0" />
            <span className="truncate">{title}</span>
          </div>
          {onHide && (
            <button
              onClick={onHide}
              className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
              title="Hide"
            >
              <FiEyeOff size={13} />
            </button>
          )}
        </div>
      )}
      <div className={`flex-1 min-h-0 min-w-0 overflow-auto ${isEditMode ? 'p-3' : 'p-4'}`}>
        {children}
      </div>
    </Card>
  )
})

WidgetWrapper.displayName = 'WidgetWrapper'
export default WidgetWrapper