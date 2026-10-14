import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiSave, FiPlus, FiX, FiDollarSign } from 'react-icons/fi'
import { addProject, updateProject } from './projectsSlice'
import { onProjectCreated } from '../achievements/achievementsSlice'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import FormSelect from '../../components/ui/FormSelect'
import CurrencyInput from '../finance/CurrencyInput'

const ProjectForm = ({ onClose, editProject = null }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const isEditMode = !!editProject
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  // ✅ State اولیه — با استفاده از editProject (نه project)
  const [formData, setFormData] = useState({
    name: editProject?.name || '',
    description: editProject?.description || '',
    color: editProject?.color || '#3b82f6',
    // ✅ فیلدهای مالی
    budget: editProject?.budget || '',
    budgetCurrency: editProject?.budgetCurrency || 'IRR',
    budgetPeriod: editProject?.budgetPeriod || 'total'
  })
  const [loading, setLoading] = useState(false)

  // ✅ useEffect برای sync
  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name || '',
        description: editProject.description || '',
        color: editProject.color || '#3b82f6',
        budget: editProject.budget || '',
        budgetCurrency: editProject.budgetCurrency || 'IRR',
        budgetPeriod: editProject.budgetPeriod || 'total'
      })
    }
  }, [editProject])

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#6366f1', '#14b8a6', '#a855f7'
  ]

  const budgetPeriodOptions = [
    { value: 'total', label: isPersian ? 'کل پروژه' : 'Total' },
    { value: 'monthly', label: isPersian ? 'ماهانه' : 'Monthly' },
    { value: 'weekly', label: isPersian ? 'هفتگی' : 'Weekly' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error(t('errors.required'), {
        position: "bottom-left",
        autoClose: 3000,
      })
      return
    }

    setLoading(true)
    try {
      // ✅ آماده‌سازی payload
      const payload = {
        name: formData.name.trim(),
        description: formData.description,
        color: formData.color,
        budget: formData.budget && parseFloat(formData.budget) > 0
          ? parseFloat(formData.budget)
          : null,
        budgetCurrency: formData.budgetCurrency,
        budgetPeriod: formData.budgetPeriod
      }

      if (isEditMode) {
        dispatch(updateProject({
          id: editProject.id,
          ...payload
        }))
        toast.success(`${formData.name} - ${t('actions.save')}`, {
          position: "bottom-left",
          autoClose: 3000,
        })
      } else {
        dispatch(addProject(payload))
        dispatch(onProjectCreated())
        toast.success(`${formData.name} - ${t('actions.create')}`, {
          position: "bottom-left",
          autoClose: 3000,
        })
      }
      
      // ✅ Reset
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        budget: '',
        budgetCurrency: 'IRR',
        budgetPeriod: 'total'
      })
      
      if (onClose) onClose()
    } catch (error) {
      console.error('Error saving project:', error)
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

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* نام */}
        <Input
          label={`${t('projects.form.name')} *`}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder={t('projects.form.namePlaceholder')}
          required
          autoFocus
        />
        
        {/* توضیحات */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('projects.form.description')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder={t('projects.form.descriptionPlaceholder')}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* رنگ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('projects.form.color')}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => handleChange('color', color)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  formData.color === color 
                    ? 'border-gray-800 dark:border-white ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-600 scale-110' 
                    : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                {formData.color === color && (
                  <span className="text-white text-lg font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ بودجه پروژه */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FiDollarSign size={14} className="text-emerald-600" />
            {isPersian ? 'بودجه پروژه (اختیاری)' : 'Project Budget (optional)'}
          </h4>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {isPersian 
              ? 'اگر برای این پروژه بودجه مشخصی داری، اینجا وارد کن. در صفحه مالی می‌تونی هزینه‌های پروژه رو پیگیری کنی.'
              : 'If you have a specific budget for this project, enter it here.'}
          </p>

          <CurrencyInput
            label={isPersian ? 'مبلغ بودجه' : 'Budget Amount'}
            value={formData.budget}
            onChange={(e) => handleChange('budget', e.target.value)}
            currency={formData.budgetCurrency}
            placeholder="0"
          />

          {formData.budget && parseFloat(formData.budget) > 0 && (
            <FormSelect
              label={isPersian ? 'دوره بودجه' : 'Budget Period'}
              value={formData.budgetPeriod}
              onChange={(e) => handleChange('budgetPeriod', e.target.value)}
              options={budgetPeriodOptions}
            />
          )}
        </div>

        {/* دکمه‌ها */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="submit"
            loading={loading}
            disabled={!formData.name.trim()}
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

export default ProjectForm