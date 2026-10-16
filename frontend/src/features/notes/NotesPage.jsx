import React, { useState, useMemo, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiPlus,
  FiSearch,
  FiGrid,
  FiList,
  FiArchive,
  FiX,
  FiEdit3,
  FiTag,
  FiCheckCircle,
  FiBookmark,
  FiTrash2,
  FiCheck,
  FiFolder
} from 'react-icons/fi'
import {
  deleteNote,
  togglePinNote,
  toggleArchiveNote,
  toggleChecklistItem
} from './notesSlice'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import NoteCard from './NoteCard'
import NoteForm from './NoteForm'
import { formatNumber } from '../../utils/formatters'

const NotesPage = memo(() => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const { notes = [] } = useSelector(state => state.notes)

  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, noteId: null, noteTitle: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTag, setFilterTag] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showArchived, setShowArchived] = useState(false)

  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  // ✅ useMemo: فیلتر
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (showArchived !== note.archived) return false

      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesTitle = note.title?.toLowerCase().includes(term)
        const matchesContent = note.content?.toLowerCase().includes(term)
        const matchesTags = note.tags?.some(t => t.toLowerCase().includes(term))
        if (!matchesTitle && !matchesContent && !matchesTags) return false
      }

      if (filterTag !== 'all' && !note.tags?.includes(filterTag)) return false

      return true
    })
  }, [notes, searchTerm, filterTag, showArchived])

  // ✅ useMemo: مرتب‌سازی با Pin
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
  }, [filteredNotes])

  // ✅ useMemo: همه تگ‌ها
  const allTags = useMemo(() => {
    const tags = new Set()
    notes.forEach(n => {
      if (n.tags) n.tags.forEach(t => tags.add(t))
    })
    return [...tags]
  }, [notes])

  // ✅ useMemo: آمار
  const stats = useMemo(() => {
    let pinnedCount = 0
    let withChecklistCount = 0
    let archivedCount = 0
    let activeCount = 0

    for (const note of notes) {
      if (note.archived) archivedCount++
      else activeCount++
    }

    for (const note of filteredNotes) {
      if (note.pinned) pinnedCount++
      if (note.checklist && note.checklist.length > 0) withChecklistCount++
    }

    return { pinnedCount, withChecklistCount, archivedCount, activeCount }
  }, [notes, filteredNotes])

  // ✅ useCallback: هندلرها
  const handleCreate = useCallback(() => {
    setEditingNote(null)
    setShowForm(true)
  }, [])

  const handleEdit = useCallback((note) => {
    setEditingNote(note)
    setShowForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setEditingNote(null)
  }, [])

  const handleDelete = useCallback((note) => {
    setDeleteConfirm({
      isOpen: true,
      noteId: note.id,
      noteTitle: note.title || (isPersian ? 'بدون عنوان' : 'Untitled')
    })
  }, [isPersian])

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirm({ isOpen: false, noteId: null, noteTitle: '' })
  }, [])

  const confirmDelete = useCallback(() => {
    dispatch(deleteNote(deleteConfirm.noteId))
    toast.success(
      <div className="flex items-center gap-2">
        <FiTrash2 size={20} className="flex-shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold">
            {isPersian ? 'یادداشت حذف شد' : 'Note deleted'}
          </div>
          <div className="text-xs opacity-90 truncate max-w-[200px]">
            {deleteConfirm.noteTitle}
          </div>
        </div>
      </div>,
      { position: "bottom-left", autoClose: 3000 }
    )
    setDeleteConfirm({ isOpen: false, noteId: null, noteTitle: '' })
  }, [dispatch, deleteConfirm.noteId, deleteConfirm.noteTitle, isPersian])

  const handleTogglePin = useCallback((noteId) => {
    const note = notes.find(n => n.id === noteId)
    dispatch(togglePinNote(noteId))
    
    if (note && !note.pinned) {
      toast.success(
        <div className="flex items-center gap-2">
          <FiBookmark size={18} className="flex-shrink-0" />
          <span>{isPersian ? 'یادداشت پین شد' : 'Note pinned'}</span>
        </div>,
        { position: "bottom-left", autoClose: 2000 }
      )
    } else if (note) {
      toast.info(
        <div className="flex items-center gap-2">
          <FiBookmark size={18} className="flex-shrink-0" />
          <span>{isPersian ? 'پین برداشته شد' : 'Note unpinned'}</span>
        </div>,
        { position: "bottom-left", autoClose: 2000 }
      )
    }
  }, [dispatch, notes, isPersian])

  const handleToggleArchive = useCallback((noteId) => {
    const note = notes.find(n => n.id === noteId)
    dispatch(toggleArchiveNote(noteId))
    
    if (note && !note.archived) {
      toast.info(
        <div className="flex items-center gap-2">
          <FiArchive size={18} className="flex-shrink-0" />
          <span>{isPersian ? 'یادداشت آرشیو شد' : 'Note archived'}</span>
        </div>,
        { position: "bottom-left", autoClose: 2000 }
      )
    } else if (note) {
      toast.success(
        <div className="flex items-center gap-2">
          <FiFolder size={18} className="flex-shrink-0" />
          <span>{isPersian ? 'از آرشیو خارج شد' : 'Note unarchived'}</span>
        </div>,
        { position: "bottom-left", autoClose: 2000 }
      )
    }
  }, [dispatch, notes, isPersian])

  const handleToggleChecklist = useCallback((noteId, itemId) => {
    dispatch(toggleChecklistItem({ noteId, itemId }))
  }, [dispatch])

  const handleCopy = useCallback(async (note) => {
    try {
      const text = `${note.title ? note.title + '\n\n' : ''}${note.content || ''}`
      await navigator.clipboard.writeText(text)
      toast.success(
        <div className="flex items-center gap-2">
          <FiCheck size={18} className="flex-shrink-0" />
          <span>{isPersian ? 'متن کپی شد' : 'Text copied'}</span>
        </div>,
        { position: "bottom-left", autoClose: 2000 }
      )
    } catch (error) {
      console.error('Copy error:', error)
      toast.error(
        <div className="flex items-center gap-2">
          <FiX size={18} className="flex-shrink-0" />
          <span>{isPersian ? 'خطا در کپی' : 'Copy failed'}</span>
        </div>,
        { position: "bottom-left", autoClose: 3000 }
      )
    }
  }, [isPersian])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setFilterTag('all')
  }, [])

  const toggleShowArchived = useCallback(() => setShowArchived(prev => !prev), [])
  const setGridView = useCallback(() => setViewMode('grid'), [])
  const setListView = useCallback(() => setViewMode('list'), [])

  const hasActiveFilters = searchTerm || filterTag !== 'all'

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiEdit3 className="text-blue-600" size={26} />
            <span>{t('notes.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('notes.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={setGridView}
              className={`px-3 py-2 transition-colors text-sm flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={setListView}
              className={`px-3 py-2 transition-colors text-sm flex items-center gap-1.5 border-s border-gray-300 dark:border-gray-600 ${
                viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiList size={16} />
            </button>
          </div>

          <Button 
            variant={showArchived ? 'primary' : 'secondary'}
            onClick={toggleShowArchived}
            size="small"
          >
            <FiArchive size={14} />
            <span>{t('notes.archived')}</span>
          </Button>

          <Button onClick={handleCreate}>
            <FiPlus size={16} />
            <span>{t('notes.new')}</span>
          </Button>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <FiEdit3 size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(showArchived ? stats.archivedCount : stats.activeCount)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {showArchived ? t('notes.archivedCount') : t('notes.totalNotes')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
              <FiBookmark size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.pinnedCount)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('notes.pinnedCount')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <FiCheckCircle size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.withChecklistCount)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('notes.withChecklist')}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* فیلترها */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <FiSearch 
                size={16} 
                className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                placeholder={t('notes.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pe-9"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="secondary" onClick={clearFilters} title={t('notes.clearFilters')}>
                <FiX size={16} />
              </Button>
            )}
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <FiTag size={12} />
                {t('notes.filterByTag')}:
              </span>
              <button
                onClick={() => setFilterTag('all')}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  filterTag === 'all'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t('notes.allTags')}
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    filterTag === tag
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {filteredNotes.length} {t('notes.found')}
          </div>
        </div>
      </Card>

      {/* لیست یادداشت‌ها */}
      {sortedNotes.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-3"
        }>
          {sortedNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              compact={viewMode === 'list'}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              onToggleArchive={handleToggleArchive}
              onToggleChecklist={handleToggleChecklist}
              onCopy={handleCopy}
              onTagClick={setFilterTag}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <FiEdit3 size={40} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {showArchived 
              ? t('notes.emptyArchived') 
              : searchTerm || filterTag !== 'all' 
                ? t('notes.noResults') 
                : t('notes.empty')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {showArchived 
              ? t('notes.emptyArchivedDesc') 
              : searchTerm || filterTag !== 'all'
                ? t('notes.noResultsDesc')
                : t('notes.emptyDesc')}
          </p>
          {!showArchived && !searchTerm && filterTag === 'all' && (
            <Button onClick={handleCreate}>
              <FiPlus size={16} />
              <span>{t('notes.createFirst')}</span>
            </Button>
          )}
          {(searchTerm || filterTag !== 'all') && (
            <Button variant="secondary" onClick={clearFilters}>
              <FiX size={16} />
              <span>{t('notes.clearFilters')}</span>
            </Button>
          )}
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingNote ? t('notes.form.editTitle') : t('notes.form.createTitle')}
      >
        <NoteForm note={editingNote} onClose={handleCloseForm} />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title={t('actions.delete')}
        message={`"${deleteConfirm.noteTitle}"?`}
        confirmText={t('actions.confirm')}
        cancelText={t('actions.cancel')}
        variant="danger"
      />
    </div>
  )
})
NotesPage.displayName = 'NotesPage'

export default NotesPage