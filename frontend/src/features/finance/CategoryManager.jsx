import React, { useState, useMemo, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiSave,
  FiTrendingUp, FiTrendingDown
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import {
  addCategory,
  updateCategory,
  deleteCategory
} from './financeSlice'

const COLOR_OPTIONS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#14b8a6', '#f97316', '#a855f7', '#6b7280'
]

const CategoryForm = memo(({ type, category = null, onClose }) => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const isEdit = !!category

  const [formData, setFormData] = useState({
    name: category?.name || '',
    color: category?.color || '#3b82f6'
  })

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error(isPersian ? 'نام الزامی است' : 'Name is required', {
        position: 'bottom-left', autoClose: 3000
      })
      return
    }

    if (isEdit) {
      dispatch(updateCategory({ 
        type, 
        id: category.id, 
        updates: formData 
      }))
      toast.success(isPersian ? 'ذخیره شد' : 'Saved', {
        position: 'bottom-left', autoClose: 2000
      })
    } else {
      dispatch(addCategory({ 
        type, 
        category: {
          ...formData,
          id: formData.name.toLowerCase().replace(/\s+/g, '_')
        }
      }))
      toast.success(isPersian ? 'دسته اضافه شد' : 'Category added', {
        position: 'bottom-left', autoClose: 2000
      })
    }
    onClose()
  }, [formData, type, isEdit, category, dispatch, isPersian, onClose])

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="default"
      title={isEdit 
        ? (isPersian ? 'ویرایش دسته' : 'Edit Category')
        : (isPersian ? 'دسته جدید' : 'New Category')
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isPersian ? 'نام' : 'Name'}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={isPersian ? 'مثلاً: قهوه' : 'e.g., Coffee'}
            autoFocus
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isPersian ? 'رنگ' : 'Color'}
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color }))}
                className={`
                  w-9 h-9 rounded-full transition-all
                  ${formData.color === color
                    ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110'
                    : 'hover:scale-105'
                  }
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" className="flex-1 !bg-emerald-600 hover:!bg-emerald-700">
            <FiSave size={16} />
            <span>{isPersian ? 'ذخیره' : 'Save'}</span>
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            <FiX size={16} />
            <span>{isPersian ? 'انصراف' : 'Cancel'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  )
})
CategoryForm.displayName = 'CategoryForm'

const CategoryManager = memo(() => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const finance = useSelector(state => state.finance || {})
  const { categories = { income: [], expense: [] } } = finance

  const [editingType, setEditingType] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [activeType, setActiveType] = useState('expense')

  const activeList = categories[activeType] || []

  const handleAdd = (type) => {
    setEditingType(type)
    setEditingCategory(null)
  }

  const handleEdit = (type, category) => {
    setEditingType(type)
    setEditingCategory(category)
  }

  const handleDelete = (type, category) => {
    if (!window.confirm(isPersian 
      ? `حذف "${category.name}"؟` 
      : `Delete "${category.name}"?`
    )) return
    dispatch(deleteCategory({ type, id: category.id }))
    toast.success(isPersian ? 'حذف شد' : 'Deleted', {
      position: 'bottom-left', autoClose: 2000
    })
  }

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'expense', label: isPersian ? 'هزینه‌ها' : 'Expenses', Icon: FiTrendingDown, color: '#ef4444' },
          { id: 'income', label: isPersian ? 'درآمدها' : 'Income', Icon: FiTrendingUp, color: '#10b981' }
        ].map(tab => {
          const Icon = tab.Icon
          const isActive = activeType === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id)}
              className={`
                flex-1 py-2.5 rounded-lg text-sm font-medium
                transition-colors flex items-center justify-center gap-2
                ${isActive
                  ? 'text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
              style={isActive ? { backgroundColor: tab.color } : {}}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span className="text-xs opacity-70">({categories[tab.id]?.length || 0})</span>
            </button>
          )
        })}
      </div>

      {/* دکمه افزودن */}
      <Button
        onClick={() => handleAdd(activeType)}
        variant="secondary"
        className="w-full"
      >
        <FiPlus size={14} />
        <span>{isPersian ? 'دسته جدید' : 'New Category'}</span>
      </Button>

      {/* لیست */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {activeList.map(cat => (
          <div
            key={cat.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
          >
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0"
              style={{ backgroundColor: `${cat.color}30` }}
            >
              <div
                className="w-full h-full rounded-lg"
                style={{ backgroundColor: cat.color, opacity: 0.7 }}
              />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
              {cat.name}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(activeType, cat)}
                className="text-gray-400 hover:text-emerald-500 p-1 rounded"
              >
                <FiEdit2 size={12} />
              </button>
              <button
                onClick={() => handleDelete(activeType, cat)}
                className="text-gray-400 hover:text-red-500 p-1 rounded"
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeList.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          {isPersian ? 'دسته‌ای وجود ندارد' : 'No categories'}
        </div>
      )}

      {/* Modal */}
      {editingType && (
        <CategoryForm
          type={editingType}
          category={editingCategory}
          onClose={() => { setEditingType(null); setEditingCategory(null) }}
        />
      )}
    </div>
  )
})

CategoryManager.displayName = 'CategoryManager'

export default CategoryManager