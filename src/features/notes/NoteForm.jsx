import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import {
    FiSave,
    FiPlus,
    FiX,
    FiTag,
    FiList,
    FiCheckCircle,
    FiCircle,
    FiEdit3,
    FiBookmark
} from 'react-icons/fi'
import { addNote, updateNote, NOTE_COLORS } from './notesSlice'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import TagInput from '../tasks/TagInput'

const NoteForm = ({ note = null, onClose }) => {
    const { t, i18n } = useTranslation()
    const dispatch = useDispatch()
    const isEditMode = !!note
    const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

    const [formData, setFormData] = useState({
        title: note?.title || '',
        content: note?.content || '',
        colorId: note?.colorId || 'default',
        tags: note?.tags || [],
        checklist: note?.checklist || [],
        pinned: note?.pinned || false
    })
    const [newChecklistItem, setNewChecklistItem] = useState('')
    const [loading, setLoading] = useState(false)

    // ✅ افزودن آیتم checklist
    const handleAddChecklistItem = () => {
        if (!newChecklistItem.trim()) return
        setFormData(prev => ({
            ...prev,
            checklist: [
                ...prev.checklist,
                {
                    id: uuidv4(),
                    text: newChecklistItem.trim(),
                    done: false
                }
            ]
        }))
        setNewChecklistItem('')
    }

    // ✅ حذف آیتم checklist
    const handleRemoveChecklistItem = (itemId) => {
        setFormData(prev => ({
            ...prev,
            checklist: prev.checklist.filter(i => i.id !== itemId)
        }))
    }

    // ✅ Toggle checklist item
    const handleToggleChecklistItem = (itemId) => {
        setFormData(prev => ({
            ...prev,
            checklist: prev.checklist.map(i =>
                i.id === itemId ? { ...i, done: !i.done } : i
            )
        }))
    }

    // ✅ ویرایش متن checklist item
    const handleEditChecklistItem = (itemId, text) => {
        setFormData(prev => ({
            ...prev,
            checklist: prev.checklist.map(i =>
                i.id === itemId ? { ...i, text } : i
            )
        }))
    }

    // ✅ ارسال
    const handleSubmit = (e) => {
        e.preventDefault()

        if (!formData.title.trim() && !formData.content.trim() && formData.checklist.length === 0) {
            toast.error(
                <div className="flex items-center gap-2">
                    <FiX size={18} className="flex-shrink-0" />
                    <span>{isPersian ? 'عنوان یا محتوا الزامی است' : 'Title or content required'}</span>
                </div>,
                { position: "bottom-left", autoClose: 3000 }
            )
            return
        }

        setLoading(true)
        try {
            if (isEditMode) {
                dispatch(updateNote({ id: note.id, ...formData }))
                toast.success(
                    <div className="flex items-center gap-2">
                        <FiSave size={20} className="flex-shrink-0" />
                        <div className="min-w-0">
                            <div className="font-semibold">
                                {isPersian ? 'یادداشت ذخیره شد' : 'Note saved'}
                            </div>
                            <div className="text-xs opacity-90 truncate max-w-[200px]">
                                {formData.title || (isPersian ? 'بدون عنوان' : 'Untitled')}
                            </div>
                        </div>
                    </div>,
                    { position: "bottom-left", autoClose: 3000 }
                )
            } else {
                dispatch(addNote(formData))

                const itemCount = formData.checklist.length
                const tagCount = formData.tags.length
                const stats = []
                if (itemCount > 0) stats.push(`${itemCount} ${isPersian ? 'آیتم' : 'items'}`)
                if (tagCount > 0) stats.push(`${tagCount} ${isPersian ? 'تگ' : 'tags'}`)

                toast.success(
                    <div className="flex items-center gap-2">
                        <FiEdit3 size={20} className="flex-shrink-0" />
                        <div className="min-w-0">
                            <div className="font-semibold">
                                {isPersian ? 'یادداشت ساخته شد' : 'Note created'}
                            </div>
                            <div className="text-xs opacity-90 truncate max-w-[200px]">
                                {formData.title || (isPersian ? 'بدون عنوان' : 'Untitled')}
                                {stats.length > 0 && ` • ${stats.join(' • ')}`}
                            </div>
                        </div>
                    </div>,
                    { position: "bottom-left", autoClose: 3500 }
                )
            }
            onClose()
        } catch (error) {
            console.error('Error saving note:', error)
            toast.error(
                <div className="flex items-center gap-2">
                    <FiX size={18} className="flex-shrink-0" />
                    <span>{isPersian ? 'خطا در ذخیره' : 'Save failed'}</span>
                </div>,
                { position: "bottom-left", autoClose: 3000 }
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* عنوان + دکمه Pin */}
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <Input
                            label={t('notes.form.title')}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t('notes.form.titlePlaceholder')}
                            autoFocus
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pinned: !formData.pinned })}
                        className={`p-3 rounded-lg transition-colors ${formData.pinned
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-yellow-500'
                            }`}
                        title={formData.pinned ? (isPersian ? 'برداشتن Pin' : 'Unpin') : (isPersian ? 'Pin کردن' : 'Pin')}
                    >
                        <FiBookmark size={18} />
                    </button>
                </div>

                {/* محتوا */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('notes.form.content')}
                    </label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder={t('notes.form.contentPlaceholder')}
                        rows="5"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        style={{ fontFamily: 'inherit' }}
                    />
                </div>

                {/* Checklist */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FiList size={14} className="text-gray-500" />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('notes.form.checklist')}
                        </label>
                        {formData.checklist.length > 0 && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                {formData.checklist.filter(i => i.done).length}/{formData.checklist.length}
                            </span>
                        )}
                    </div>

                    {formData.checklist.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                            {formData.checklist.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleToggleChecklistItem(item.id)}
                                        className="flex-shrink-0"
                                    >
                                        {item.done ? (
                                            <FiCheckCircle size={18} className="text-green-500" />
                                        ) : (
                                            <FiCircle size={18} className="text-gray-400 hover:text-blue-500" />
                                        )}
                                    </button>
                                    <input
                                        type="text"
                                        value={item.text}
                                        onChange={(e) => handleEditChecklistItem(item.id, e.target.value)}
                                        className={`flex-1 bg-transparent border-none outline-none text-sm ${item.done
                                                ? 'line-through text-gray-400 dark:text-gray-500'
                                                : 'text-gray-700 dark:text-gray-300'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveChecklistItem(item.id)}
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
                            value={newChecklistItem}
                            onChange={(e) => setNewChecklistItem(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddChecklistItem()
                                }
                            }}
                            placeholder={t('notes.form.addItem')}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                        />
                        <Button
                            type="button"
                            onClick={handleAddChecklistItem}
                            disabled={!newChecklistItem.trim()}
                            variant="secondary"
                            size="small"
                        >
                            <FiPlus size={14} />
                            <span>{t('actions.add')}</span>
                        </Button>
                    </div>
                </div>

                {/* تگ‌ها */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                        <FiTag size={14} />
                        <span>{t('notes.form.tags')}</span>
                    </label>
                    <TagInput
                        tags={formData.tags}
                        onChange={(tags) => setFormData({ ...formData, tags })}
                    />
                </div>

                {/* رنگ */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('notes.form.color')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {NOTE_COLORS.map(color => {
                            const isSelected = formData.colorId === color.id
                            return (
                                <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, colorId: color.id })}
                                    className={`
                    w-10 h-10 rounded-full transition-all flex items-center justify-center border-2
                    ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}
                    ${color.border}
                  `}
                                    style={{ backgroundColor: color.value === 'transparent' ? '#f9fafb' : color.value }}
                                    title={t(`notes.colors.${color.id}`)}
                                >
                                    {isSelected && <FiCheckCircle size={18} className="text-gray-700 dark:text-white" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* دکمه‌ها */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="submit" loading={loading} className="flex-1">
                        <FiSave size={16} />
                        <span>{isEditMode ? t('actions.save') : t('actions.create')}</span>
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

export default NoteForm