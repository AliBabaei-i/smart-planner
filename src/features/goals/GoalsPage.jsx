import React, { useState, useMemo, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiPlus,
  FiTarget,
  FiSearch,
  FiX,
  FiArchive,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiFlag,
  FiAward,
  FiFilter
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import GoalForm from './GoalForm'
import GoalCard from './GoalCard'
import GoalDetailsModal from './GoalDetailsModal'
import {
  deleteGoal,
  toggleArchiveGoal,
  GOAL_CATEGORIES
} from './goalsSlice'
import { formatNumber } from '../../utils/formatters'

const GoalsPage = memo(() => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { goals = [] } = useSelector(state => state.goals || { goals: [] })

  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [viewingGoal, setViewingGoal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, goalId: null, goalTitle: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('active')
  const [showArchived, setShowArchived] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  // ✅ useMemo: فیلتر
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      if (showArchived !== !!goal.archived) return false
      if (filterCategory !== 'all' && goal.category !== filterCategory) return false
      if (filterStatus !== 'all' && goal.status !== filterStatus) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchTitle = goal.title?.toLowerCase().includes(term)
        const matchDesc = goal.description?.toLowerCase().includes(term)
        if (!matchTitle && !matchDesc) return false
      }
      return true
    })
  }, [goals, searchTerm, filterCategory, filterStatus, showArchived])

  // ✅ useMemo: آمار
  const stats = useMemo(() => {
    let activeCount = 0
    let completedCount = 0
    let totalMilestones = 0
    let doneMilestones = 0

    for (const g of goals) {
      if (g.archived) continue
      if (g.status === 'active') activeCount++
      if (g.status === 'completed') completedCount++
      const milestones = g.milestones || []
      totalMilestones += milestones.length
      doneMilestones += milestones.filter(m => m.completed).length
    }

    const overallProgress = totalMilestones > 0
      ? Math.round((doneMilestones / totalMilestones) * 100)
      : 0

    return { activeCount, completedCount, totalMilestones, doneMilestones, overallProgress }
  }, [goals])

  // ✅ useMemo: options
  const categoryOptions = useMemo(() => [
    { value: 'all', label: t('goals.status.all') },
    ...GOAL_CATEGORIES.map(c => ({ value: c.id, label: t(`goals.categories.${c.id}`) }))
  ], [t])

  const statusOptions = useMemo(() => [
    { value: 'all', label: t('goals.status.all') },
    { value: 'active', label: t('goals.status.active') },
    { value: 'completed', label: t('goals.status.completed') },
    { value: 'paused', label: t('goals.status.paused') },
    { value: 'cancelled', label: t('goals.status.cancelled') }
  ], [t])

  // ✅ useCallback: هندلرها
  const handleCreate = useCallback(() => {
    setEditingGoal(null)
    setShowForm(true)
  }, [])

  const handleEdit = useCallback((goal) => {
    setEditingGoal(goal)
    setShowForm(true)
    setViewingGoal(prev => prev?.id === goal.id ? null : prev)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setEditingGoal(null)
  }, [])

  const handleView = useCallback((goal) => {
    setViewingGoal(goal)
  }, [])

  const handleCloseView = useCallback(() => {
    setViewingGoal(null)
  }, [])

  const handleDelete = useCallback((goal) => {
    setDeleteConfirm({ isOpen: true, goalId: goal.id, goalTitle: goal.title })
  }, [])

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirm({ isOpen: false, goalId: null, goalTitle: '' })
  }, [])

  const confirmDelete = useCallback(() => {
    dispatch(deleteGoal(deleteConfirm.goalId))
    toast.success(t('goals.toast.deleted'), {
      position: 'bottom-left',
      autoClose: 2500,
    })
    setDeleteConfirm({ isOpen: false, goalId: null, goalTitle: '' })
    setViewingGoal(prev => prev?.id === deleteConfirm.goalId ? null : prev)
  }, [dispatch, deleteConfirm.goalId, t])

  const handleArchive = useCallback((goal) => {
    dispatch(toggleArchiveGoal(goal.id))
    toast.success(
      goal.archived ? t('goals.toast.unarchived') : t('goals.toast.archived'),
      { position: 'bottom-left', autoClose: 2000 }
    )
  }, [dispatch, t])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setFilterCategory('all')
    setFilterStatus('active')
  }, [])

  const toggleShowArchived = useCallback(() => setShowArchived(prev => !prev), [])
  const toggleShowFilters = useCallback(() => setShowFilters(prev => !prev), [])
  const setGridView = useCallback(() => setViewMode('grid'), [])
  const setListView = useCallback(() => setViewMode('list'), [])

  const hasActiveFilters = searchTerm || filterCategory !== 'all' || filterStatus !== 'active'

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiTarget className="text-blue-600" size={26} />
            <span>{t('goals.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('goals.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={setGridView}
              className={`px-3 py-2 transition-colors text-sm ${
                viewMode === 'grid'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={setListView}
              className={`px-3 py-2 transition-colors text-sm border-s border-gray-300 dark:border-gray-600 ${
                viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiList size={16} />
            </button>
          </div>

          <Button
            variant={showArchived ? 'primary' : 'secondary'}
            size="small"
            onClick={toggleShowArchived}
          >
            <FiArchive size={14} />
            <span>{t('goals.archived')}</span>
          </Button>

          <Button onClick={handleCreate}>
            <FiPlus size={16} />
            <span>{t('goals.new')}</span>
          </Button>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiTarget size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.activeCount)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('goals.activeGoals')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiAward size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.completedCount)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('goals.completedGoals')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiFlag size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.totalMilestones)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('goals.milestones')}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiCheckCircle size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.overallProgress)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('goals.overallProgress')}
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
                placeholder={t('goals.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pe-9"
              />
            </div>
            <Button
              variant="secondary"
              onClick={toggleShowFilters}
            >
              <FiFilter size={16} />
            </Button>
            {hasActiveFilters && (
              <Button variant="secondary" onClick={clearFilters} title={t('goals.clearFilters')}>
                <FiX size={16} />
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('goals.form.category')}
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('goals.form.status')}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatNumber(filteredGoals.length)} {t('goals.found')}
          </div>
        </div>
      </Card>

      {/* لیست اهداف */}
      {filteredGoals.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => handleView(goal)}
              onEdit={() => handleEdit(goal)}
              onDelete={() => handleDelete(goal)}
              onArchive={() => handleArchive(goal)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <FiTarget size={40} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {showArchived
              ? t('goals.emptyArchived')
              : hasActiveFilters
              ? t('goals.noResults')
              : t('goals.empty')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {hasActiveFilters ? t('goals.noResultsDesc') : t('goals.emptyDesc')}
          </p>
          {!showArchived && !hasActiveFilters && (
            <Button onClick={handleCreate}>
              <FiPlus size={16} />
              <span>{t('goals.createFirst')}</span>
            </Button>
          )}
          {hasActiveFilters && (
            <Button variant="secondary" onClick={clearFilters}>
              <FiX size={16} />
              <span>{t('goals.clearFilters')}</span>
            </Button>
          )}
        </Card>
      )}

      {/* Modal ایجاد/ویرایش */}
      <Modal
  isOpen={showForm}
  onClose={handleCloseForm}
  size="xlarge"      
  title={editingGoal ? t('goals.form.editTitle') : t('goals.form.createTitle')}
>
  <GoalForm goal={editingGoal} onClose={handleCloseForm}/>
</Modal>

      {/* Modal جزئیات */}
      <GoalDetailsModal
        isOpen={!!viewingGoal}
        onClose={handleCloseView}
        goal={viewingGoal}
        onEdit={handleEdit}
      />

      {/* Confirm حذف */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        title={t('actions.delete')}
        message={`"${deleteConfirm.goalTitle}"?`}
        confirmText={t('actions.confirm')}
        cancelText={t('actions.cancel')}
        variant="danger"
      />
    </div>
  )
})
GoalsPage.displayName = 'GoalsPage'

export default GoalsPage