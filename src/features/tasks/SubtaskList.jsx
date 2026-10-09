import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiPlus, FiCheckCircle, FiCircle, FiX, FiList } from 'react-icons/fi'
import { addSubtask, toggleSubtask, deleteSubtask } from './tasksSlice'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const SubtaskList = ({ taskId, subtasks = [] }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [newSubtask, setNewSubtask] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      dispatch(addSubtask({ taskId, title: newSubtask.trim() }))
      setNewSubtask('')
      setIsAdding(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSubtask()
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewSubtask('')
    }
  }

  const completedCount = subtasks.filter(st => st.completed).length
  const totalCount = subtasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FiList size={16} className="text-gray-500 flex-shrink-0" />
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
            {t('tasks.form.subtasks')}
          </h4>
          {totalCount > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            <FiPlus size={14} />
            <span>{t('actions.add')}</span>
          </button>
        )}
      </div>

      {totalCount > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-blue-500 h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {isAdding && (
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('tasks.form.addSubtask')}
            autoFocus
            className="flex-1"
          />
          <Button onClick={handleAddSubtask} disabled={!newSubtask.trim()} size="small">
            <FiPlus size={14} />
          </Button>
          <Button 
            onClick={() => { setIsAdding(false); setNewSubtask('') }}
            variant="secondary"
            size="small"
          >
            <FiX size={14} />
          </Button>
        </div>
      )}

      {subtasks.length > 0 ? (
        <div className="space-y-1.5">
          {subtasks.map(subtask => (
            <div 
              key={subtask.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group gap-2"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  onClick={() => dispatch(toggleSubtask({ taskId, subtaskId: subtask.id }))}
                  className="flex-shrink-0"
                >
                  {subtask.completed ? (
                    <FiCheckCircle size={18} className="text-green-500" />
                  ) : (
                    <FiCircle size={18} className="text-gray-400 hover:text-blue-500" />
                  )}
                </button>
                <span className={`text-sm truncate ${
                  subtask.completed 
                    ? 'line-through text-gray-400 dark:text-gray-500' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {subtask.title}
                </span>
              </div>
              <button
                onClick={() => dispatch(deleteSubtask({ taskId, subtaskId: subtask.id }))}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 flex-shrink-0"
                title={t('actions.delete')}
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
            {t('tasks.form.subtaskHint')}
          </div>
        )
      )}
    </div>
  )
}

export default SubtaskList