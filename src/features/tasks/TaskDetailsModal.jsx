import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiSave,
  FiEdit2,
  FiCheckCircle,
  FiCircle,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiTag,
  FiList,
  FiFileText,
  FiChevronLeft,
  FiRepeat
} from 'react-icons/fi'
import { 
  updateTaskNotes, 
  toggleTaskStatus,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateSubtask
} from './tasksSlice'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import TagBadge from './TagBadge'
import { formatTimeByLang, formatLongDateByLang } from '../../utils/formatters'
import { PRIORITIES } from '../../constants/priorities'

const TaskDetailsModal = ({ isOpen, onClose, task, onEdit }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { projects = [] } = useSelector(state => state.projects)
  const [notes, setNotes] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [editingSubtask, setEditingSubtask] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  useEffect(() => {
    if (task) {
      setNotes(task.notes || '')
      setNewSubtask('')
      setEditingSubtask(null)
    }
  }, [task])

  if (!task) return null

  const project = projects.find(p => p.id === task.projectId)
  const priorityInfo = PRIORITIES[task.priority]
  
  const subtasks = task.subtasks || []
  const completedSubtasks = subtasks.filter(st => st.completed).length
  const subtaskProgress = subtasks.length > 0 
    ? Math.round((completedSubtasks / subtasks.length) * 100) 
    : 0

  const handleSaveNotes = () => {
    dispatch(updateTaskNotes({ taskId: task.id, notes }))
    toast.success(t('actions.save'), {
      position: "bottom-left",
      autoClose: 2000,
    })
  }

  const handleToggleStatus = () => {
    dispatch(toggleTaskStatus(task.id))
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    dispatch(addSubtask({ taskId: task.id, title: newSubtask.trim() }))
    setNewSubtask('')
  }

  const handleDeleteSubtask = (subtaskId) => {
    dispatch(deleteSubtask({ taskId: task.id, subtaskId }))
  }

  const handleToggleSubtask = (subtaskId) => {
    dispatch(toggleSubtask({ taskId: task.id, subtaskId }))
  }

  const startEditSubtask = (subtask) => {
    setEditingSubtask(subtask.id)
    setEditingTitle(subtask.title)
  }

  const saveEditSubtask = () => {
    if (editingTitle.trim() && editingSubtask) {
      dispatch(updateSubtask({ 
        taskId: task.id, 
        subtaskId: editingSubtask, 
        title: editingTitle.trim() 
      }))
    }
    setEditingSubtask(null)
    setEditingTitle('')
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEditSubtask()
    } else if (e.key === 'Escape') {
      setEditingSubtask(null)
      setEditingTitle('')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('tasks.details.title')}
      size="large"
    >
      <div className="space-y-5">
        {/* عنوان و وضعیت */}
        <div>
          <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
            <h2 className={`text-xl font-bold flex-1 ${
              task.completed 
                ? 'line-through text-gray-400 dark:text-gray-500' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {task.title}
            </h2>
            <button
              onClick={handleToggleStatus}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                task.completed
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {task.completed ? (
                <>
                  <FiCheckCircle size={14} />
                  <span>{t('tasks.status.completed')}</span>
                </>
              ) : (
                <>
                  <FiCircle size={14} />
                  <span>{t('tasks.status.pending')}</span>
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {project && (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {project.name}
                </span>
              </div>
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${priorityInfo.bgColor} ${priorityInfo.color}`}>
              {t(`tasks.priority.${task.priority}`)}
            </span>
            {task.recurring && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
                <FiRepeat size={12} />
                <span>{t(`tasks.form.${task.recurring}`)}</span>
              </span>
            )}
          </div>
        </div>

        {/* توضیحات */}
        {task.description && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FiFileText size={14} />
              <span>{t('tasks.form.description')}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* تگ‌ها */}
        {task.tags && task.tags.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FiTag size={14} />
              <span>{t('tasks.form.tags')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.tags.map(tag => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>
        )}

        {/* اطلاعات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {task.dueDate && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                <FiCalendar size={12} />
                <span>{t('tasks.form.dueDate')}</span>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatLongDateByLang(task.dueDate)}
              </div>
            </div>
          )}

          {task.dueTime !== null && task.dueTime !== undefined && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                <FiClock size={12} />
                <span>{t('tasks.form.dueTime')}</span>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                {task.dueTime.toString().padStart(2, '0')}:۰۰
              </div>
            </div>
          )}

          {task.timeEstimate && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                <FiClock size={12} />
                <span>{t('tasks.form.timeEstimate')}</span>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatTimeByLang(task.timeEstimate)}
              </div>
            </div>
          )}

          {task.actualTime > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                <FiCheckCircle size={12} />
                <span>{t('analytics.cards.effectiveTime')}</span>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatTimeByLang(task.actualTime)}
              </div>
            </div>
          )}
        </div>

        {/* زیرتسک‌ها */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiList size={16} className="text-gray-500" />
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {t('tasks.form.subtasks')}
              </h4>
              {subtasks.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {completedSubtasks}/{subtasks.length}
                </span>
              )}
            </div>
          </div>

          {subtasks.length > 0 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full transition-all ${
                  subtaskProgress === 100 
                    ? 'bg-green-500' 
                    : 'bg-gradient-to-l from-green-500 to-blue-500'
                }`}
                style={{ width: `${subtaskProgress}%` }}
              ></div>
            </div>
          )}

          {subtasks.length > 0 ? (
            <div className="space-y-2 mb-4">
              {subtasks.map(subtask => (
                <div 
                  key={subtask.id}
                  className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <button
                    onClick={() => handleToggleSubtask(subtask.id)}
                    className="flex-shrink-0"
                  >
                    {subtask.completed ? (
                      <FiCheckCircle size={18} className="text-green-500" />
                    ) : (
                      <FiCircle size={18} className="text-gray-400 hover:text-blue-500" />
                    )}
                  </button>
                  
                  {editingSubtask === subtask.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={saveEditSubtask}
                      autoFocus
                      className="flex-1 bg-white dark:bg-gray-600 px-2 py-1 rounded border border-blue-500 text-sm text-gray-900 dark:text-white outline-none"
                    />
                  ) : (
                    <span 
                      className={`flex-1 text-sm cursor-pointer ${
                        subtask.completed 
                          ? 'line-through text-gray-400 dark:text-gray-500' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                      onDoubleClick={() => startEditSubtask(subtask)}
                      title={t('actions.edit')}
                    >
                      {subtask.title}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => startEditSubtask(subtask)}
                      className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-1"
                      title={t('actions.edit')}
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1"
                      title={t('actions.delete')}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm mb-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <FiList size={32} className="mx-auto mb-2 opacity-50" />
              <p>{t('tasks.form.subtaskHint')}</p>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSubtask()
                }
              }}
              placeholder={t('tasks.form.addSubtask')}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
            <Button
              type="button"
              onClick={handleAddSubtask}
              disabled={!newSubtask.trim()}
              size="small"
            >
              <FiPlus size={14} />
            </Button>
          </div>
        </div>

        {/* یادداشت */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
            <FiFileText size={16} />
            <span>{t('tasks.form.notes')}</span>
          </h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('tasks.form.notesPlaceholder')}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleSaveNotes}
              size="small"
              disabled={notes === (task.notes || '')}
            >
              <FiSave size={14} />
              <span>{t('actions.save')}</span>
            </Button>
          </div>
        </div>

        {/* دکمه‌ها */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            onClick={() => {
              onClose()
              if (onEdit) onEdit(task)
            }}
            className="flex-1"
          >
            <FiEdit2 size={16} />
            <span>{t('actions.edit')}</span>
          </Button>
          <Button 
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            <FiChevronLeft size={16} />
            <span>{t('actions.close')}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TaskDetailsModal