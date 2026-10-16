import React, { memo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiChevronUp, FiChevronDown, FiX } from 'react-icons/fi'
import { toggleWidget, setWidgetSize, moveWidget } from './dashboardSlice'

// ✅ Constants خارج از کامپوننت
const SIZE_CLASSES = {
  small: 'col-span-1 md:col-span-1',
  medium: 'col-span-1 md:col-span-1 lg:col-span-1',
  large: 'col-span-1 md:col-span-2 lg:col-span-2',
  full: 'col-span-1 md:col-span-2 lg:col-span-3'
}

const SIZE_LABELS = {
  small: 'کوچک',
  medium: 'متوسط',
  large: 'بزرگ',
  full: 'کامل'
}

const WidgetWrapper = memo(({ id, title, size, children }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { editMode } = useSelector(state => state.dashboard || {})

  const handleSizeChange = useCallback((e) => {
    dispatch(setWidgetSize({ id, size: e.target.value }))
  }, [dispatch, id])

  const handleMoveUp = useCallback(() => {
    dispatch(moveWidget({ id, direction: 'up' }))
  }, [dispatch, id])

  const handleMoveDown = useCallback(() => {
    dispatch(moveWidget({ id, direction: 'down' }))
  }, [dispatch, id])

  const handleToggle = useCallback(() => {
    dispatch(toggleWidget(id))
  }, [dispatch, id])

  return (
    <div className={`${SIZE_CLASSES[size] || SIZE_CLASSES.medium} transition-all`}>
      <div className={`h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 ${
        editMode 
          ? 'border-dashed border-blue-400 dark:border-blue-500' 
          : 'border-transparent'
      } transition-colors`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center truncate">
            {title}
          </h3>

          {editMode && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <select
                value={size}
                onChange={handleSizeChange}
                className="text-xs px-1.5 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="small">{SIZE_LABELS.small}</option>
                <option value="medium">{SIZE_LABELS.medium}</option>
                <option value="large">{SIZE_LABELS.large}</option>
                <option value="full">{SIZE_LABELS.full}</option>
              </select>

              <button
                onClick={handleMoveUp}
                className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiChevronUp size={14} />
              </button>

              <button
                onClick={handleMoveDown}
                className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiChevronDown size={14} />
              </button>

              <button
                onClick={handleToggle}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
})
WidgetWrapper.displayName = 'WidgetWrapper'

export default WidgetWrapper