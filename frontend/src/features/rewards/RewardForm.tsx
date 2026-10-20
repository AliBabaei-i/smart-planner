import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiSave, FiX } from 'react-icons/fi'
import { addReward } from './rewardsSlice'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import FormSelect from '../../components/ui/FormSelect'
import FormTextarea from '../../components/ui/FormTextarea'
import type { RootState, AppDispatch } from '../../app/store'

interface RewardFormProps {
  onClose: () => void
}

const REWARD_ICONS = ['🎁', '🍿', '🎮', '☕', '🍕', '🛌', '📺', '🏆', '❤️', '🍩']

const RewardForm = ({ onClose }: RewardFormProps) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const { projects = [] } = useSelector((state: RootState) => state.projects)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🎁',
    conditionType: 'tasks_completed',
    targetValue: 5,
    projectId: ''
  })

  const conditionOptions = [
    { value: 'tasks_completed', label: isPersian ? 'تعداد کل تسک‌های انجام شده' : 'Total tasks completed' },
    { value: 'project_tasks_completed', label: isPersian ? 'تسک‌های یک پروژه خاص' : 'Specific project tasks' },
    { value: 'streak_days', label: isPersian ? 'روزهای متوالی فعالیت' : 'Streak days' },
    { value: 'pomodoro_count', label: isPersian ? 'تعداد پومودوروها' : 'Pomodoro sessions' },
    { value: 'manual', label: isPersian ? 'دستی (بدون شرط)' : 'Manual (no condition)' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error(isPersian ? 'عنوان پاداش را وارد کنید' : 'Enter reward title')
      return
    }
    
    if (formData.conditionType === 'project_tasks_completed' && !formData.projectId) {
      toast.error(isPersian ? 'یک پروژه انتخاب کنید' : 'Select a project')
      return
    }

    dispatch(addReward({
      ...formData,
      targetValue: formData.conditionType === 'manual' ? 0 : Number(formData.targetValue),
      projectId: formData.conditionType === 'project_tasks_completed' ? formData.projectId : null
    }))
    
    toast.success(isPersian ? 'پاداش جدید اضافه شد' : 'Reward added')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {REWARD_ICONS.map(icon => (
          <button
            key={icon}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, icon }))}
            className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
              formData.icon === icon ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500 scale-110' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      <Input
        label={isPersian ? 'عنوان پاداش' : 'Reward Title'}
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        placeholder={isPersian ? 'مثال: یک ساعت بازی' : 'e.g., 1 hour of gaming'}
        required
      />

      <FormTextarea
        label={isPersian ? 'توضیحات (اختیاری)' : 'Description (optional)'}
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        rows={2}
      />

      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
          {isPersian ? 'شرط آزادسازی پاداش' : 'Condition to unlock'}
        </h4>

        <FormSelect
          value={formData.conditionType}
          onChange={(e) => setFormData(prev => ({ ...prev, conditionType: e.target.value }))}
          options={conditionOptions}
        />

        {formData.conditionType === 'project_tasks_completed' && (
          <FormSelect
            value={formData.projectId}
            onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
            options={[{ value: '', label: 'انتخاب پروژه...' }, ...projects.map(p => ({ value: p.id, label: p.name }))]}
          />
        )}

        {formData.conditionType !== 'manual' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isPersian ? 'تعداد هدف' : 'Target Count'}
            </label>
            <input
              type="number"
              min="1"
              value={formData.targetValue}
              onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="submit" className="flex-1">
          <FiSave size={16} />
          <span>{isPersian ? 'ثبت پاداش' : 'Save Reward'}</span>
        </Button>
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          <FiX size={16} />
          <span>{isPersian ? 'انصراف' : 'Cancel'}</span>
        </Button>
      </div>
    </form>
  )
}

export default RewardForm