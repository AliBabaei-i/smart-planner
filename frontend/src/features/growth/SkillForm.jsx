import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiSave,
  FiX,
  FiCheckCircle,
  FiTrendingUp
} from 'react-icons/fi'
import {
  addSkill,
  updateSkill,
  SKILL_COLORS,
  SKILL_CATEGORIES,
  SKILL_LEVELS
} from './growthSlice'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import FormSelect from '../../components/ui/FormSelect'
import FormTextarea from '../../components/ui/FormTextarea'

const SkillForm = ({ skill = null, onClose }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isEdit = !!skill

  const [formData, setFormData] = useState({
    name: skill?.name || '',
    description: skill?.description || '',
    category: skill?.category || 'other',
    level: skill?.level || 1,
    targetLevel: skill?.targetLevel || 5,
    color: skill?.color || '#3b82f6',
    hours: skill?.hours || 0
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error(t('errors.required'), { position: 'bottom-left', autoClose: 3000 })
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        dispatch(updateSkill({ id: skill.id, ...formData }))
        toast.success(t('growth.toast.skillSaved'), { position: 'bottom-left', autoClose: 2500 })
      } else {
        dispatch(addSkill(formData))
        toast.success(t('growth.toast.skillCreated'), { position: 'bottom-left', autoClose: 2500 })
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(t('errors.error'), { position: 'bottom-left', autoClose: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = SKILL_CATEGORIES.map(c => ({
    value: c.id,
    label: t(`growth.categories.${c.id}`)
  }))

  const levelOptions = SKILL_LEVELS.map(l => ({
    value: l.value,
    label: t(`growth.levels.${l.key}`)
  }))

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={`${t('growth.form.skillName')} *`}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('growth.form.skillNamePlaceholder')}
          required
          autoFocus
        />

        <FormTextarea
          label={t('growth.form.skillDescription')}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('growth.form.skillDescriptionPlaceholder')}
          rows={2}
        />

        <FormSelect
          label={t('growth.form.category')}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={categoryOptions}
        />

        {/* سطوح */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <FiCheckCircle size={14} />
              {t('growth.form.currentLevel')}
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {levelOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <FiTrendingUp size={14} />
              {t('growth.form.targetLevel')}
            </label>
            <select
              value={formData.targetLevel}
              onChange={(e) => setFormData({ ...formData, targetLevel: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {levelOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* رنگ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('growth.form.color')}
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILL_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-9 h-9 rounded-full transition-all flex items-center justify-center ${
                  formData.color === color
                    ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              >
                {formData.color === color && <FiCheckCircle size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

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

export default SkillForm