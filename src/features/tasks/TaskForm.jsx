import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import {
  FiSave,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiCircle,
  FiRepeat,
  FiList,
  FiTag
} from 'react-icons/fi'
import { addTask, updateTask } from './tasksSlice'
import { onTaskCreated, onTagAdded } from '../achievements/achievementsSlice'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import FormSelect from '../../components/ui/FormSelect'
import FormTextarea from '../../components/ui/FormTextarea'
import TagInput from './TagInput'
import { PRIORITY_OPTIONS } from '../../constants/priorities'

const TaskForm = ({ projectId, onClose, initialData = {}, editTask = null }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { projects = [] } = useSelector(state => state.projects)
  const isEditMode = !!editTask
  
  const getInitialFormData = () => {
    if (editTask) {
      return {
        title: editTask.title || '',
        description: editTask.description || '',
        projectId: editTask.projectId || '',
        priority: editTask.priority || 'medium',
        dueDate: editTask.dueDate || '',
        dueTime: editTask.dueTime !== null && editTask.dueTime !== undefined ? editTask.dueTime : '',
        timeEstimate: editTask.timeEstimate || '',
        tags: editTask.tags || [],
        subtasks: editTask.subtasks || [],
        recurring: editTask.recurring || '',
        recurringEndDate: editTask.recurringEndDate || ''
      }
    }
    return {
      title: initialData.title || '',
      description: initialData.description || '',
      projectId: projectId || initialData.projectId || '',
      priority: initialData.priority || 'medium',
      dueDate: initialData.dueDate || '',
      dueTime: initialData.dueTime !== undefined && initialData.dueTime !== null ? initialData.dueTime : '',
      timeEstimate: initialData.timeEstimate || '',
      tags: initialData.tags || [],
      subtasks: initialData.subtasks || [],
      recurring: initialData.recurring || '',
      recurringEndDate: initialData.recurringEndDate || ''
    }
  }
  
  const [formData, setFormData] = useState(getInitialFormData())
  const [newSubtask, setNewSubtask] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title || '',
        description: editTask.description || '',
        projectId: editTask.projectId || '',
        priority: editTask.priority || 'medium',
        dueDate: editTask.dueDate || '',
        dueTime: editTask.dueTime !== null && editTask.dueTime !== undefined ? editTask.dueTime : '',
        timeEstimate: editTask.timeEstimate || '',
        tags: editTask.tags || [],
        subtasks: editTask.subtasks || [],
        recurring: editTask.recurring || '',
        recurringEndDate: editTask.recurringEndDate || ''
      })
    }
  }, [editTask])

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    
    const newSubtaskItem = {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtaskItem]
    }))
    setNewSubtask('')
  }

  const handleRemoveSubtask = (subtaskId) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== subtaskId)
    }))
  }

  const handleToggleSubtask = (subtaskId) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    }))
  }

  const handleEditSubtask = (subtaskId, newTitle) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(st => 
        st.id === subtaskId ? { ...st, title: newTitle } : st
      )
    }))
  }

  const handleSubtaskKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSubtask()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.projectId) {
      toast.error(t('errors.required'), {
        position: "bottom-left",
        autoClose: 3000,
      })
      return
    }

    setLoading(true)
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        projectId: formData.projectId,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        dueTime: formData.dueTime !== '' ? parseInt(formData.dueTime) : null,
        timeEstimate: formData.timeEstimate ? parseInt(formData.timeEstimate) : null,
        tags: formData.tags || [],
        subtasks: formData.subtasks || [],
        recurring: formData.recurring || null,
        recurringEndDate: formData.recurringEndDate || null
      }

      if (isEditMode) {
        dispatch(updateTask({
          id: editTask.id,
          ...taskData
        }))
        toast.success(`${formData.title} - ${t('actions.save')}`, {
          position: "bottom-left",
          autoClose: 3000,
        })
      } else {
        dispatch(addTask(taskData))
        dispatch(onTaskCreated())
        if (formData.tags && formData.tags.length > 0) {
          dispatch(onTagAdded(formData.tags.length))
        }
        toast.success(`${formData.title} - ${t('actions.create')}`, {
          position: "bottom-left",
          autoClose: 3000,
        })
      }
      
      if (!isEditMode) {
        setFormData({
          title: '',
          description: '',
          projectId: projectId || '',
          priority: 'medium',
          dueDate: '',
          dueTime: '',
          timeEstimate: '',
          tags: [],
          subtasks: [],
          recurring: '',
          recurringEndDate: ''
        })
      }
      if (onClose) onClose()
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error(t('errors.error'), {
        position: "bottom-left",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const hourOptions = Array.from({ length: 19 }, (_, i) => i + 5).map(hour => ({
    value: hour,
    label: `${hour.toString().padStart(2, '0')}:۰۰`
  }))

  const priorityOptions = PRIORITY_OPTIONS.map(opt => ({
    value: opt.value,
    label: t(`tasks.priority.${opt.value}`)
  }))

  const projectOptions = projects.map(p => ({
    value: p.id,
    label: p.name
  }))

  const recurringOptions = [
    { value: 'daily', label: t('tasks.form.daily') },
    { value: 'weekly', label: t('tasks.form.weekly') },
    { value: 'monthly', label: t('tasks.form.monthly') }
  ]

  const subtaskStats = {
    total: formData.subtasks.length,
    completed: formData.subtasks.filter(st => st.completed).length
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* عنوان */}
        <Input
          label={`${t('tasks.form.title')} *`}
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder={t('tasks.form.titlePlaceholder')}
          required
          autoFocus
        />
        
        {/* توضیحات */}
        <FormTextarea
          label={t('tasks.form.description')}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder={t('tasks.form.descriptionPlaceholder')}
          rows={2}
        />

        {/* پروژه */}
        <FormSelect
          label={t('tasks.form.project')}
          value={formData.projectId}
          onChange={(e) => handleChange('projectId', e.target.value)}
          options={projectOptions}
          placeholder={t('tasks.form.selectProject')}
          required
        />

        
        {/* ۴ ستون: اولویت، تاریخ، ساعت، زمان */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  <FormSelect
    label={t('tasks.form.priority')}
    value={formData.priority}
    onChange={(e) => handleChange('priority', e.target.value)}
    options={priorityOptions}
  />

  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">
      {t('tasks.form.dueDate')}
    </label>
    <input
      type="date"
      value={formData.dueDate}
      onChange={(e) => handleChange('dueDate', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      style={{ fontFamily: 'inherit' }}
    />
  </div>

  <FormSelect
    label={t('tasks.form.dueTime')}
    value={formData.dueTime}
    onChange={(e) => handleChange('dueTime', e.target.value)}
    options={hourOptions}
    placeholder={t('tasks.form.selectTime')}
  />

  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">
      {t('tasks.form.timeEstimate')}
    </label>
    <input
      type="number"
      value={formData.timeEstimate}
      onChange={(e) => handleChange('timeEstimate', e.target.value)}
      placeholder="60"
      min="1"
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center"
      style={{ fontFamily: 'inherit' }}
    />
  </div>
</div>

        {/* تگ‌ها */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <FiTag size={14} />
            <span>{t('tasks.form.tags')}</span>
          </label>
          <TagInput 
            tags={formData.tags || []}
            onChange={(tags) => handleChange('tags', tags)}
          />
        </div>

        {/* تکرار */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <FiRepeat size={14} className="text-gray-500" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('tasks.form.recurring')}
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              value={formData.recurring || ''}
              onChange={(e) => handleChange('recurring', e.target.value || null)}
              options={recurringOptions}
              placeholder={t('tasks.form.noRecurring')}
            />

            {formData.recurring && (
              <Input
                label={t('tasks.form.recurringEnd')}
                type="date"
                value={formData.recurringEndDate || ''}
                onChange={(e) => handleChange('recurringEndDate', e.target.value)}
              />
            )}
          </div>
        </div>

        {/* زیرتسک‌ها */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FiList size={14} />
              <span>{t('tasks.form.subtasks')}</span>
              {subtaskStats.total > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {subtaskStats.completed}/{subtaskStats.total}
                </span>
              )}
            </label>
          </div>

          {subtaskStats.total > 0 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(subtaskStats.completed / subtaskStats.total) * 100}%` }}
              ></div>
            </div>
          )}

          {formData.subtasks.length > 0 && (
            <div className="space-y-2 mb-3">
              {formData.subtasks.map(subtask => (
                <div 
                  key={subtask.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(subtask.id)}
                    className="flex-shrink-0"
                  >
                    {subtask.completed ? (
                      <FiCheckCircle size={18} className="text-green-500" />
                    ) : (
                      <FiCircle size={18} className="text-gray-400 hover:text-blue-500" />
                    )}
                  </button>
                  
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => handleEditSubtask(subtask.id, e.target.value)}
                    className={`flex-1 bg-transparent border-none outline-none text-sm ${
                      subtask.completed 
                        ? 'line-through text-gray-400 dark:text-gray-500' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title={t('actions.delete')}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={handleSubtaskKeyDown}
              placeholder={t('tasks.form.addSubtask')}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
            <Button
              type="button"
              onClick={handleAddSubtask}
              disabled={!newSubtask.trim()}
              variant="secondary"
              size="small"
            >
              <FiPlus size={14} />
              <span>{t('actions.add')}</span>
            </Button>
          </div>

          {formData.subtasks.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {t('tasks.form.subtaskHint')}
            </p>
          )}
        </div>

        {/* دکمه‌ها */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            loading={loading}
            disabled={!formData.title.trim() || !formData.projectId}
            className="flex-1"
          >
            {isEditMode ? (
              <>
                <FiSave size={16} />
                <span>{t('actions.save')}</span>
              </>
            ) : (
              <>
                <FiPlus size={16} />
                <span>{t('actions.create')}</span>
              </>
            )}
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              <FiX size={16} />
              <span>{t('actions.cancel')}</span>
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}

export default TaskForm