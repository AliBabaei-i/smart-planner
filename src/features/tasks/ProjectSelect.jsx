import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiFolder, FiX, FiPlus, FiSearch, FiCheck } from 'react-icons/fi'

const ProjectSelect = ({
  value = '',
  onChange,
  placeholder = null,
  required = false,
  error = null,
  disabled = false,
  autoFocus = false
}) => {
  const { t } = useTranslation()
  const { projects = [] } = useSelector(state => state.projects)

  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const defaultPlaceholder = placeholder || t('tasks.form.selectProject') || 'انتخاب پروژه...'

  // ✅ پروژه انتخاب‌شده
  const selectedProject = useMemo(
    () => projects.find(p => p.id === value) || null,
    [projects, value]
  )

  // ✅ فیلتر پروژه‌ها
  const filteredProjects = useMemo(() => {
    if (!input.trim()) return projects
    const term = input.toLowerCase().trim()
    return projects.filter(p =>
      p.name?.toLowerCase().includes(term)
    )
  }, [projects, input])

  // ✅ ذخیره highlightedIndex وقتی فیلتر عوض می‌شه
  useEffect(() => {
    setHighlightedIndex(0)
  }, [input])

  // ✅ بستن با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
        setInput('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ✅ اسکرول به آیتم highlighted
  useEffect(() => {
    if (isOpen && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-project]')
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [isOpen, highlightedIndex])

  // ✅ autoFocus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // ✅ انتخاب پروژه
  const selectProject = useCallback((project) => {
    if (onChange) {
      onChange({ target: { value: project.id, name: 'projectId' } })
    }
    setInput('')
    setIsOpen(false)
    setHighlightedIndex(0)
  }, [onChange])

  // ✅ پاک کردن انتخاب
  const clearSelection = useCallback((e) => {
    e?.stopPropagation()
    if (onChange) {
      onChange({ target: { value: '', name: 'projectId' } })
    }
    setInput('')
    setIsOpen(false)
  }, [onChange])

  // ✅ باز کردن dropdown
  const openDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(true)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [disabled])

  // ✅ کیبورد
  const handleKeyDown = useCallback((e) => {
    if (disabled) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        setHighlightedIndex(prev => Math.min(prev + 1, filteredProjects.length - 1))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (isOpen && filteredProjects[highlightedIndex]) {
        selectProject(filteredProjects[highlightedIndex])
      } else if (!isOpen) {
        setIsOpen(true)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setInput('')
    } else if (e.key === 'Backspace' && input === '' && selectedProject) {
      clearSelection()
    }
  }, [disabled, isOpen, filteredProjects, highlightedIndex, selectProject, clearSelection, input, selectedProject])

  const showSearch = isOpen || !selectedProject
  const showEmptyState = filteredProjects.length === 0 && input.trim()

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        onClick={openDropdown}
        className={`
          flex flex-wrap items-center gap-2 p-2
          border rounded-lg bg-white dark:bg-gray-700
          focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500
          transition-colors min-h-[42px]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          ${error 
            ? 'border-red-500 dark:border-red-500' 
            : 'border-gray-300 dark:border-gray-600'
          }
        `}
        style={{ fontFamily: 'inherit' }}
      >
        {/* پروژه انتخاب‌شده */}
        {selectedProject && !showSearch && (
          <span
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm max-w-full"
            style={{ 
              backgroundColor: `${selectedProject.color}20`,
              color: selectedProject.color 
            }}
          >
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedProject.color }}
            />
            <span className="truncate font-medium" style={{ fontFamily: 'inherit' }}>
              {selectedProject.name}
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="ms-0.5 hover:opacity-70 flex-shrink-0"
              title={t('actions.delete')}
            >
              <FiX size={12} />
            </button>
          </span>
        )}

        {/* Input جستجو */}
        {showSearch && (
          <>
            <FiSearch size={14} className="text-gray-400 flex-shrink-0 ms-1" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={selectedProject ? '' : defaultPlaceholder}
              disabled={disabled}
              className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm py-1"
              style={{ fontFamily: 'inherit' }}
            />
          </>
        )}

        {/* آیکون پیش‌فرض وقتی خالیه */}
        {!selectedProject && !input && (
          <FiFolder size={14} className="text-gray-400 flex-shrink-0 ms-1 order-first" />
        )}
      </div>

      {/* پیام خطا */}
      {error && (
        <p className="mt-1 text-xs text-red-500" style={{ fontFamily: 'inherit' }}>
          {error}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute top-full mt-1 inset-x-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto animate-fade-in"
          style={{ fontFamily: 'inherit' }}
        >
          {/* هدر */}
          <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 flex items-center gap-1.5 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <FiFolder size={12} />
            <span>{t('nav.projects')}</span>
            <span className="ms-auto text-gray-400">
              {filteredProjects.length}
            </span>
          </div>

          {showEmptyState ? (
            <div className="p-4 text-center text-sm text-gray-400 dark:text-gray-500">
              <FiFolder size={24} className="mx-auto mb-2 opacity-50" />
              <p>{t('tasks.form.noProjects') || 'پروژه‌ای پیدا نشد'}</p>
              {input.trim() && (
                <p className="text-xs mt-1 opacity-75">
                  "{input}" {t('tasks.form.notFound') || 'یافت نشد'}
                </p>
              )}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400 dark:text-gray-500">
              <FiFolder size={24} className="mx-auto mb-2 opacity-50" />
              <p>{t('tasks.form.noProjectsYet') || 'هنوز پروژه‌ای نداری'}</p>
            </div>
          ) : (
            filteredProjects.map((project, index) => {
              const isSelected = project.id === value
              const isHighlighted = index === highlightedIndex

              return (
                <button
                  key={project.id}
                  data-project
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    selectProject(project)
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full text-start px-3 py-2 transition-colors
                    flex items-center gap-2
                    ${isHighlighted 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                    ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                  style={{ fontFamily: 'inherit' }}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white dark:ring-gray-700"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className={`flex-1 truncate text-sm ${
                    isSelected 
                      ? 'text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {project.name}
                  </span>
                  {isSelected && (
                    <FiCheck size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

ProjectSelect.displayName = 'ProjectSelect'

export default memo(ProjectSelect)