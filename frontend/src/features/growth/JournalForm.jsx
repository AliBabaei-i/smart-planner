import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiSave,
  FiX,
  FiPlus,
  FiSmile,
  FiZap,
  FiStar,
  FiAlertTriangle
} from 'react-icons/fi'
import { addJournal, updateJournal } from './growthSlice'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import FormTextarea from '../../components/ui/FormTextarea'
import DatePicker from '../../components/ui/DatePicker'

// ✅ FIX: تاریخ محلی (به جای UTC)
const getLocalDateStr = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const JournalForm = ({ journal = null, onClose }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isEdit = !!journal

  const [formData, setFormData] = useState({
    // ✅ FIX: تاریخ محلی
    date: journal?.date || getLocalDateStr(),
    mood: journal?.mood || 3,
    energy: journal?.energy || 3,
    wins: journal?.wins || [],
    challenges: journal?.challenges || [],
    reflection: journal?.reflection || '',
    gratitude: journal?.gratitude || ''
  })
  const [newWin, setNewWin] = useState('')
  const [newChallenge, setNewChallenge] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        dispatch(updateJournal({ id: journal.id, ...formData }))
        toast.success(t('growth.toast.journalSaved'), { position: 'bottom-left', autoClose: 2500 })
      } else {
        dispatch(addJournal(formData))
        toast.success(t('growth.toast.journalCreated'), { position: 'bottom-left', autoClose: 2500 })
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(t('errors.error'), { position: 'bottom-left', autoClose: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const addItem = (field, value, setter) => {
    if (!value.trim()) return
    setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }))
    setter('')
  }

  const removeItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  const MoodSelector = ({ value, onChange, Icon, label }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
        <Icon size={16} />
        <span>{label}</span>
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 py-2 rounded-lg border-2 transition-all ${
              value === v
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-xl">
              {v === 1 ? '😢' : v === 2 ? '😐' : v === 3 ? '🙂' : v === 4 ? '😊' : '😄'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ✅ تاریخ — DatePicker */}
        <DatePicker
          label={t('growth.form.date')}
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          placeholder={t('tasks.form.selectDate') || 'انتخاب تاریخ'}
        />

        {/* حالت روحی */}
        <MoodSelector
          value={formData.mood}
          onChange={(v) => setFormData({ ...formData, mood: v })}
          Icon={FiSmile}
          label={t('growth.form.mood')}
        />

        {/* انرژی */}
        <MoodSelector
          value={formData.energy}
          onChange={(v) => setFormData({ ...formData, energy: v })}
          Icon={FiZap}
          label={t('growth.form.energy')}
        />

        {/* دستاوردها */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <FiStar size={16} className="text-green-500" />
            <span>{t('growth.form.wins')}</span>
          </label>
          {formData.wins.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {formData.wins.map((win, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg group">
                  <FiStar size={14} className="text-green-500 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{win}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('wins', i)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"
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
              value={newWin}
              onChange={(e) => setNewWin(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem('wins', newWin, setNewWin) } }}
              placeholder={t('growth.form.addWin')}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="button" size="small" variant="secondary" onClick={() => addItem('wins', newWin, setNewWin)}>
              <FiPlus size={14} />
            </Button>
          </div>
        </div>

        {/* چالش‌ها */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <FiAlertTriangle size={16} className="text-orange-500" />
            <span>{t('growth.form.challenges')}</span>
          </label>
          {formData.challenges.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {formData.challenges.map((ch, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg group">
                  <FiAlertTriangle size={14} className="text-orange-500 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{ch}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('challenges', i)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"
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
              value={newChallenge}
              onChange={(e) => setNewChallenge(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem('challenges', newChallenge, setNewChallenge) } }}
              placeholder={t('growth.form.addChallenge')}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="button" size="small" variant="secondary" onClick={() => addItem('challenges', newChallenge, setNewChallenge)}>
              <FiPlus size={14} />
            </Button>
          </div>
        </div>

        {/* بازتاب */}
        <FormTextarea
          label={t('growth.form.reflection')}
          value={formData.reflection}
          onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
          placeholder={t('growth.form.reflectionPlaceholder')}
          rows={4}
        />

        {/* سپاسگزاری */}
        <FormTextarea
          label={t('growth.form.gratitude')}
          value={formData.gratitude}
          onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })}
          placeholder={t('growth.form.gratitudePlaceholder')}
          rows={2}
        />

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

export default JournalForm