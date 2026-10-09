import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiSave, FiPlus, FiX } from 'react-icons/fi'
import { addProject, updateProject } from './projectsSlice'
import { onProjectCreated } from '../achievements/achievementsSlice'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const ProjectForm = ({ onClose, editProject = null }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isEditMode = !!editProject
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name || '',
        description: editProject.description || '',
        color: editProject.color || '#3b82f6'
      })
    }
  }, [editProject])

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#6366f1', '#14b8a6', '#a855f7'
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
      if (isEditMode) {
        dispatch(updateProject({
          id: editProject.id,
          ...formData
        }))
        toast.success(`${formData.name} - ${t('actions.save')}`, {
          position: "bottom-left",
          autoClose: 3000,
        })
      } else {
        dispatch(addProject(formData))
        dispatch(onProjectCreated())
        toast.success(`${formData.name} - ${t('actions.create')}`, {
          position: "bottom-left",
          autoClose: 3000,
        })
      }
      
      setFormData({ name: '', description: '', color: '#3b82f6' })
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
        <Input
          label={`${t('projects.form.name')} *`}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder={t('projects.form.namePlaceholder')}
          required
          autoFocus
        />
        
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

        <div className="flex gap-3 pt-4">
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