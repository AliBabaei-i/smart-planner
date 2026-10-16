import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiX, FiCheck, FiCalendar, FiClock, FiTag, FiFlag,
  FiRepeat, FiZap, FiInfo, FiSend
} from 'react-icons/fi'
import { addTask } from '../../features/tasks/tasksSlice'
import { onTaskCreated, onTagAdded } from '../../features/achievements/achievementsSlice'
import { parseNaturalLanguage, getNLPExamples } from '../../utils/naturalLanguageParser'
import { formatDateByLang } from '../../utils/formatters'
import Button from './Button'
import Input from './Input'

const QuickAddTask = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const inputRef = useRef(null)
  const { projects = [] } = useSelector(state => state.projects)

  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState(null)
  const [selectedProject, setSelectedProject] = useState('')
  const [showExamples, setShowExamples] = useState(false)

  // ✅ Reset on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setInput('')
      setParsed(null)
      setSelectedProject('')
      setShowExamples(false)
    }
  }, [isOpen])

  // ✅ Esc در هر شرایطی
  useEffect(() => {
    if (!isOpen) return

    const handleGlobalEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleGlobalEsc, true)
    return () => document.removeEventListener('keydown', handleGlobalEsc, true)
  }, [isOpen, onClose])

  // ✅ Parse on change
  useEffect(() => {
    if (!input.trim()) {
      setParsed(null)
      return
    }
    const result = parseNaturalLanguage(input, projects)
    setParsed(result)
    
    if (result.projectId) {
      setSelectedProject(result.projectId)
    }
  }, [input, projects])

  const handleSubmit = () => {
    if (!parsed || !parsed.title.trim()) {
      toast.error(isPersian ? 'عنوان الزامی است' : 'Title is required', {
        position: "bottom-left",
        autoClose: 3000,
      })
      return
    }

    const projectId = selectedProject || parsed.projectId || projects[0]?.id

    if (!projectId) {
      toast.error(isPersian ? 'اول یک پروژه بساز' : 'Create a project first', {
        position: "bottom-left",
        autoClose: 3000,
      })
      return
    }

    dispatch(addTask({
      title: parsed.title,
      description: '',
      projectId,
      priority: parsed.priority || 'medium',
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
      timeEstimate: parsed.timeEstimate,
      tags: parsed.tags || [],
      subtasks: [],
      recurring: parsed.recurring,
      recurringEndDate: null
    }))

    dispatch(onTaskCreated())
    if (parsed.tags && parsed.tags.length > 0) {
      dispatch(onTagAdded(parsed.tags.length))
    }

    toast.success(
      <div className="flex items-center gap-2">
        <FiCheck size={18} />
        <span>{isPersian ? 'کار ساخته شد' : 'Task created'}</span>
      </div>,
      { position: "bottom-left", autoClose: 2000 }
    )

    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const examples = getNLPExamples(isPersian)

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-[15vh] z-[110] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FiZap size={20} className="text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {isPersian ? 'افزودن سریع' : 'Quick Add'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <FiInfo size={12} />
              <span>{isPersian ? 'مثال‌ها' : 'Examples'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="p-4">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isPersian 
              ? 'مثلاً: جلسه با رضا فردا ساعت ۳ #کاری !بالا ۳۰ دقیقه' 
              : 'e.g., Meeting tomorrow at 3pm #work !high 30min'}
            className="text-lg"
          />

          {showExamples && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                <FiInfo size={12} />
                <span>{isPersian ? 'نمونه‌ها:' : 'Examples:'}</span>
              </div>
              <div className="space-y-1">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInput(ex)}
                    className="block w-full text-start text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {parsed && parsed.matched && (
          <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {isPersian ? 'پیش‌نمایش:' : 'Preview:'}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/40 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">T</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {parsed.title}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {parsed.dueDate && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                    <FiCalendar size={10} />
                    <span>{formatDateByLang(parsed.dueDate)}</span>
                  </span>
                )}
                {parsed.dueTime !== null && parsed.dueTime !== undefined && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                    <FiClock size={10} />
                    <span>{parsed.dueTime.toString().padStart(2, '0')}:۰۰</span>
                  </span>
                )}
                {parsed.priority && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    parsed.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                    parsed.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    <FiFlag size={10} />
                    <span>{t(`tasks.priority.${parsed.priority}`)}</span>
                  </span>
                )}
                {parsed.recurring && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                    <FiRepeat size={10} />
                    <span>{t(`tasks.form.${parsed.recurring}`)}</span>
                  </span>
                )}
                {parsed.timeEstimate && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                    <FiClock size={10} />
                    <span>{parsed.timeEstimate} {isPersian ? 'دقیقه' : 'min'}</span>
                  </span>
                )}
                {parsed.tags && parsed.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full">
                    <FiTag size={10} />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              {projects.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isPersian ? 'پروژه:' : 'Project:'}
                  </span>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Enter</kbd>
            <span>{isPersian ? 'ذخیره' : 'Save'}</span>
            <kbd className="px-2 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 ms-2">Esc</kbd>
            <span>{isPersian ? 'بستن' : 'Close'}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="small" onClick={onClose}>
              {t('actions.cancel')}
            </Button>
            <Button size="small" onClick={handleSubmit} disabled={!parsed || !parsed.title.trim()}>
              <FiSend size={14} />
              <span>{isPersian ? 'ذخیره' : 'Save'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickAddTask