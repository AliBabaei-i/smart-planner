import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import {
  FiSave,
  FiPlus,
  FiX,
  FiFlag,
  FiCheckCircle,
  FiCircle
} from 'react-icons/fi'
import { addGoal, updateGoal, GOAL_CATEGORIES, GOAL_COLORS } from './goalsSlice'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import FormSelect from '../../components/ui/FormSelect'
import FormTextarea from '../../components/ui/FormTextarea'
import DatePicker from '../../components/ui/DatePicker'

// ✅ FIX: تاریخ محلی (به جای UTC)
const getLocalDateStr = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const GoalForm = ({ goal = null, onClose }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const isEdit = !!goal
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || 'personal',
    color: goal?.color || '#3b82f6',
    // ✅ FIX: تاریخ محلی به جای UTC
    startDate: goal?.startDate || getLocalDateStr(),
    targetDate: goal?.targetDate || '',
    milestones: goal?.milestones || []
  })
  const [newMilestone, setNewMilestone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return
    setFormData(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { id: uuidv4(), title: newMilestone.trim(), completed: false }
      ]
    }))
    setNewMilestone('')
  }

  const handleRemoveMilestone = (id) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id)
    }))
  }

  const handleToggleMilestone = (id) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m =>
        m.id === id ? { ...m, completed: !m.completed } : m
      )
    }))
  }

  const handleEditMilestone = (id, title) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m =>
        m.id === id ? { ...m, title } : m
      )
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error(isPersian ? 'عنوان الزامی است' : 'Title is required', {
        position: 'bottom-left',
        autoClose: 3000,
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        targetDate: formData.targetDate || null
      }

      if (isEdit) {
        dispatch(updateGoal({ id: goal.id, ...payload }))
        toast.success(isPersian ? 'تغییرات ذخیره شد' : 'Changes saved', {
          position: 'bottom-left',
          autoClose: 2500,
        })
      } else {
        dispatch(addGoal(payload))
        toast.success(isPersian ? 'هدف ایجاد شد' : 'Goal created', {
          position: 'bottom-left',
          autoClose: 2500,
        })
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(isPersian ? 'خطا در ذخیره' : 'Save failed', {
        position: 'bottom-left',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const categoryOptions = GOAL_CATEGORIES.map(c => ({
    value: c.id,
    label: t(`goals.categories.${c.id}`)
  }))

  const stats = {
    total: formData.milestones.length,
    done: formData.milestones.filter(m => m.completed).length
  }

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* عنوان */}
        <Input
          label={`${t('goals.form.title')} *`}
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder={t('goals.form.titlePlaceholder')}
          required
          autoFocus
        />

        {/* توضیحات */}
        <FormTextarea
          label={t('goals.form.description')}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder={t('goals.form.descriptionPlaceholder')}
          rows={3}
        />

        {/* دسته + رنگ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label={t('goals.form.category')}
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            options={categoryOptions}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('goals.form.color')}
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  className={`w-9 h-9 rounded-full transition-all flex items-center justify-center ${
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {formData.color === color && (
                    <FiCheckCircle size={14} className="text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ تاریخ‌ها — DatePicker به جای input native */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label={t('goals.form.startDate')}
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            placeholder={t('tasks.form.selectDate') || 'انتخاب تاریخ'}
          />

          <DatePicker
            label={t('goals.form.targetDate')}
            value={formData.targetDate || ''}
            onChange={(e) => handleChange('targetDate', e.target.value)}
            placeholder={t('tasks.form.selectDate') || 'انتخاب تاریخ'}
          />
        </div>

        {/* نقاط عطف */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FiFlag size={14} />
              <span>{t('goals.form.milestones')}</span>
              {stats.total > 0 && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                  {stats.done}/{stats.total}
                </span>
              )}
            </label>
          </div>

          {stats.total > 0 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${(stats.done / stats.total) * 100}%`,
                  backgroundColor: formData.color
                }}
              />
            </div>
          )}

          {formData.milestones.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {formData.milestones.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleMilestone(m.id)}
                    className="flex-shrink-0"
                  >
                    {m.completed ? (
                      <FiCheckCircle size={18} className="text-green-500" />
                    ) : (
                      <FiCircle size={18} className="text-gray-400 hover:text-blue-500" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => handleEditMilestone(m.id, e.target.value)}
                    className={`flex-1 bg-transparent border-none outline-none text-sm ${
                      m.completed
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(m.id)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
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
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddMilestone()
                }
              }}
              placeholder={t('goals.form.addMilestone')}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Button
              type="button"
              onClick={handleAddMilestone}
              disabled={!newMilestone.trim()}
              variant="secondary"
              size="small"
            >
              <FiPlus size={14} />
              <span>{t('actions.add')}</span>
            </Button>
          </div>
        </div>

        {/* دکمه‌ها */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" loading={loading} className="flex-1">
            <FiSave size={16} />
            <span>{isEdit ? t('actions.save') : t('actions.create')}</span>
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            <FiX size={16} />
            <span>{t('actions.cancel')}</span>
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default GoalForm