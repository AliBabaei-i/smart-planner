import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiCircle,
  FiZap,
  FiAward,
  FiTrendingUp,
  FiArchive,
  FiActivity,
  // ✅ آیکون‌های عادت
  FiDroplet,
  FiBook,
  FiFeather,
  FiSun,
  FiSunrise,
  FiMoon,
  FiEdit3,
  FiTarget
} from 'react-icons/fi'
import {
  addHabit,
  updateHabit,
  deleteHabit,
  toggleArchiveHabit,
  toggleCompletion,
  habitHelpers
} from './habitsSlice'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormTextarea from '../../components/ui/FormTextarea'
import { formatNumber, formatDateByLang } from '../../utils/formatters'
import { getPersianDayNumber } from '../../utils/persianDate'

const { calculateStreak, calculateLongestStreak, HABIT_COLORS, HABIT_ICON_OPTIONS } = habitHelpers

// ✅ Map نام آیکون به کامپوننت
const ICON_MAP = {
  FiDroplet,
  FiBook,
  FiActivity,
  FiFeather,
  FiZap,
  FiSun,
  FiSunrise,
  FiMoon,
  FiEdit3,
  FiTarget
}

// ✅ دریافت کامپوننت آیکون
const getHabitIcon = (iconId) => {
  const option = HABIT_ICON_OPTIONS.find(o => o.id === iconId)
  if (option && ICON_MAP[option.Icon]) {
    return ICON_MAP[option.Icon]
  }
  return FiTarget
}

// ✅ دریافت رشته تاریخ محلی (نه UTC)
const getLocalDateStr = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ✅ دریافت ۷ روز اخیر
const getLast7Days = () => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setHours(12, 0, 0, 0) // ✅ تنظیم ساعت به ۱۲ برای جلوگیری از مشکل timezone
    date.setDate(date.getDate() - i)
    days.push(date)
  }
  return days
}

// ✅ فرمت روز هفته
const getDayLabel = (date, lang) => {
  const days = lang === 'fa' || lang?.startsWith('fa')
    ? ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  return days[date.getDay()]
}

// ✅ دریافت شماره روز (شمسی یا میلادی)
const getDayNumber = (date, lang) => {
  if (lang === 'fa' || lang?.startsWith('fa')) {
    return getPersianDayNumber(date)
  }
  return date.getDate()
}

const HabitsPage = () => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const { habits = [], completions = {} } = useSelector(state => state.habits)
  
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, habitId: null, habitName: '' })
  const [showArchived, setShowArchived] = useState(false)

  const weekDays = getLast7Days()
  const today = getLocalDateStr(new Date())

  const visibleHabits = habits.filter(h => showArchived ? h.archived : !h.archived)
  const activeHabits = habits.filter(h => !h.archived)
  const totalStreak = activeHabits.reduce((sum, h) => {
    return sum + calculateStreak(h.id, completions)
  }, 0)
  const totalCompletedToday = activeHabits.filter(h => completions[h.id]?.[today]).length

  const handleToggle = (habitId, dateStr) => {
    dispatch(toggleCompletion({ habitId, date: dateStr }))
  }

  const handleEdit = (habit) => {
    setEditingHabit(habit)
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingHabit(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingHabit(null)
  }

  const handleDelete = (habit) => {
    setDeleteConfirm({
      isOpen: true,
      habitId: habit.id,
      habitName: habit.name
    })
  }

  const confirmDelete = () => {
    dispatch(deleteHabit(deleteConfirm.habitId))
    toast.success(`${deleteConfirm.habitName} - ${t('actions.delete')}`, {
      position: "bottom-left",
      autoClose: 3000,
    })
    setDeleteConfirm({ isOpen: false, habitId: null, habitName: '' })
  }

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiActivity className="text-blue-600" size={26} />
            <span>{t('habits.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('habits.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showArchived ? 'primary' : 'secondary'}
            onClick={() => setShowArchived(!showArchived)}
            size="small"
          >
            <FiArchive size={14} />
            <span>{t('habits.archived')}</span>
          </Button>
          <Button onClick={handleCreate}>
            <FiPlus size={16} />
            <span>{t('habits.new')}</span>
          </Button>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
              <FiActivity size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(activeHabits.length)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('habits.activeHabits')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
              <FiCheckCircle size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(totalCompletedToday)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('habits.completedToday')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center">
              <FiZap size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(totalStreak)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('habits.totalStreak')}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* لیست عادت‌ها */}
      {visibleHabits.length > 0 ? (
        <div className="space-y-3">
          {visibleHabits.map(habit => {
            const streak = calculateStreak(habit.id, completions)
            const longestStreak = calculateLongestStreak(habit.id, completions)
            const habitCompletions = completions[habit.id] || {}
            const HabitIcon = getHabitIcon(habit.iconId)

            return (
              <Card key={habit.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      <HabitIcon 
                        size={22} 
                        style={{ color: habit.color }} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {habit.name}
                        </h3>
                        {streak > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full flex items-center gap-1">
                            <FiZap size={10} />
                            <span>{formatNumber(streak)} {t('habits.days')}</span>
                          </span>
                        )}
                        {streak >= 7 && (
                          <FiAward size={14} className="text-yellow-500" />
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {habit.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiTrendingUp size={10} />
                          {t('habits.longest')}: {formatNumber(longestStreak)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(habit)}
                      className="text-gray-400 hover:text-blue-500 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={t('actions.edit')}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => dispatch(toggleArchiveHabit(habit.id))}
                      className="text-gray-400 hover:text-purple-500 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={t('habits.archive')}
                    >
                      <FiArchive size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(habit)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={t('actions.delete')}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* نمای هفتگی */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {weekDays.map((date) => {
                    const dateStr = getLocalDateStr(date)
                    const isCompleted = habitCompletions[dateStr]
                    const isToday = dateStr === today
                    const dayLabel = getDayLabel(date, i18n.language)
                    const dayNumber = getDayNumber(date, i18n.language)

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleToggle(habit.id, dateStr)}
                        className={`
                          flex-1 flex flex-col items-center gap-1 p-2 rounded-lg
                          transition-all hover:scale-105
                          ${isCompleted ? 'bg-opacity-100' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'}
                          ${isToday ? 'ring-2 ring-blue-500' : ''}
                        `}
                        style={isCompleted ? { backgroundColor: habit.color } : {}}
                        title={formatDateByLang(date)}
                      >
                        <span className={`text-xs font-medium ${isCompleted ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                          {dayLabel}
                        </span>
                        <span className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {formatNumber(dayNumber)}
                        </span>
                        {isCompleted ? (
                          <FiCheckCircle size={14} className="text-white" />
                        ) : (
                          <FiCircle size={14} className="text-gray-300 dark:text-gray-600" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <FiActivity size={40} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {showArchived ? t('habits.emptyArchived') : t('habits.empty')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {showArchived ? t('habits.emptyArchivedDesc') : t('habits.emptyDesc')}
          </p>
          {!showArchived && (
            <Button onClick={handleCreate}>
              <FiPlus size={16} />
              <span>{t('habits.createFirst')}</span>
            </Button>
          )}
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingHabit ? t('habits.form.editTitle') : t('habits.form.createTitle')}
      >
        <HabitForm 
          habit={editingHabit}
          onClose={handleCloseForm}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, habitId: null, habitName: '' })}
        onConfirm={confirmDelete}
        title={t('actions.delete')}
        message={`"${deleteConfirm.habitName}"? ${t('habits.deleteWarning')}`}
        confirmText={t('actions.confirm')}
        cancelText={t('actions.cancel')}
        variant="danger"
      />
    </div>
  )
}

// ✅ فرم عادت
const HabitForm = ({ habit, onClose }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isEditMode = !!habit

  const [formData, setFormData] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    iconId: habit?.iconId || HABIT_ICON_OPTIONS[0].id,
    color: habit?.color || HABIT_COLORS[0]
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error(t('errors.required'), { position: "bottom-left", autoClose: 3000 })
      return
    }

    setLoading(true)
    try {
      if (isEditMode) {
        dispatch(updateHabit({ id: habit.id, ...formData }))
        toast.success(t('actions.save'), { position: "bottom-left", autoClose: 3000 })
      } else {
        dispatch(addHabit(formData))
        toast.success(t('actions.create'), { position: "bottom-left", autoClose: 3000 })
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(t('errors.error'), { position: "bottom-left", autoClose: 3000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={`${t('habits.form.name')} *`}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder={t('habits.form.namePlaceholder')}
        required
        autoFocus
      />

      <FormTextarea
        label={t('habits.form.description')}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder={t('habits.form.descriptionPlaceholder')}
        rows={2}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('habits.form.icon')}
        </label>
        <div className="grid grid-cols-5 gap-2">
          {HABIT_ICON_OPTIONS.map(option => {
            const IconComponent = ICON_MAP[option.Icon]
            const isSelected = formData.iconId === option.id
            
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setFormData({ ...formData, iconId: option.id })}
                className={`
                  w-full aspect-square rounded-xl flex items-center justify-center 
                  transition-all border-2
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105 shadow-md' 
                    : 'border-transparent bg-gray-100 dark:bg-gray-700 hover:scale-105 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {IconComponent && (
                  <IconComponent 
                    size={22} 
                    style={{ color: isSelected ? option.color : undefined }}
                    className={isSelected ? '' : 'text-gray-600 dark:text-gray-400'}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('habits.form.color')}
        </label>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map(color => {
            const isSelected = formData.color === color
            return (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`
                  w-10 h-10 rounded-full transition-all flex items-center justify-center
                  ${isSelected 
                    ? 'ring-2 ring-gray-800 dark:ring-white ring-offset-2 scale-110' 
                    : 'hover:scale-105'
                  }
                `}
                style={{ backgroundColor: color }}
              >
                {isSelected && <FiCheckCircle size={16} className="text-white" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="submit" loading={loading} className="flex-1">
          {isEditMode ? t('actions.save') : t('actions.create')}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          {t('actions.cancel')}
        </Button>
      </div>
    </form>
  )
}

export default HabitsPage