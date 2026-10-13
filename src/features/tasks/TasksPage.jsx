import React, { useState, useMemo, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiCheckSquare,
  FiPlus,
  FiSearch,
  FiFilter,
  FiTrash2,
  FiEdit2,
  FiEye,
  FiClock,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiTag,
  FiList,
  FiCheckCircle,
  FiCircle,
  FiRepeat,
  FiColumns
} from 'react-icons/fi'
import { toggleTaskStatus, deleteTask } from './tasksSlice'
import { onTaskCompleted } from '../achievements/achievementsSlice'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import TaskForm from './TaskForm'
import TaskDetailsModal from './TaskDetailsModal'
import TagBadge from './TagBadge'
import TimeTracker from '../tracking/TimeTracker'
import KanbanBoard from './KanbanBoard'
import { formatTimeByLang, formatDateByLang } from '../../utils/formatters'
import { PRIORITIES } from '../../constants/priorities'

// ✅ کامپوننت TaskCard جدا + memo شده
const TaskCard = memo(({ 
  task, 
  project, 
  priorityInfo, 
  subtaskProgress,
  t,
  onToggle,
  onViewDetails,
  onStartTracking,
  onEdit,
  onDelete,
  onTagClick
}) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggle(task.id)}
            className="mt-0.5 flex-shrink-0 transition-colors"
          >
            {task.completed ? (
              <FiCheckCircle size={22} className="text-green-500 hover:text-green-600" />
            ) : (
              <FiCircle size={22} className="text-gray-400 hover:text-blue-500" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span 
                className={`font-medium text-lg cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                  task.completed 
                    ? 'line-through text-gray-400 dark:text-gray-500' 
                    : 'text-gray-900 dark:text-white'
                }`}
                onClick={() => onViewDetails(task)}
              >
                {task.title}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityInfo.bgColor} ${priorityInfo.color} font-medium`}>
                {t(`tasks.priority.${task.priority}`)}
              </span>
              {task.recurring && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex items-center gap-1">
                  <FiRepeat size={10} />
                  <span>{t(`tasks.form.${task.recurring}`)}</span>
                </span>
              )}
              {task.status === 'in-progress' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1">
                  <FiClock size={10} />
                  <span>{t('kanban.inProgress')}</span>
                </span>
              )}
            </div>
            
            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                {task.description}
              </p>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {task.tags.map(tag => (
                  <TagBadge 
                    key={tag} 
                    tag={tag}
                    clickable
                    onClick={() => onTagClick(tag)}
                  />
                ))}
              </div>
            )}

            {subtaskProgress && subtaskProgress.total > 0 && (
              <div className="mt-2 p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg max-w-md">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <FiList size={12} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t('tasks.form.subtasks')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      subtaskProgress.percentage === 100 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {subtaskProgress.completed}/{subtaskProgress.total}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {subtaskProgress.percentage}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      subtaskProgress.percentage === 100 
                        ? 'bg-green-500' 
                        : 'bg-gradient-to-l from-green-500 to-blue-500'
                    }`}
                    style={{ width: `${subtaskProgress.percentage}%` }}
                  ></div>
                </div>

                <div className="space-y-1">
                  {task.subtasks.slice(0, 2).map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 text-xs">
                      {subtask.completed ? (
                        <FiCheckCircle size={12} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <FiCircle size={12} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`truncate ${
                        subtask.completed 
                          ? 'line-through text-gray-400 dark:text-gray-500' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                  {task.subtasks.length > 2 && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 ps-5">
                      + {task.subtasks.length - 2} {t('tasks.more')}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap mt-2">
              <div className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project?.color || '#6b7280' }}
                ></div>
                <span>{project?.name || t('tasks.form.selectProject')}</span>
              </div>
              
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <FiCalendar size={12} />
                  <span>{formatDateByLang(task.dueDate)}</span>
                </span>
              )}

              {task.dueTime !== null && task.dueTime !== undefined && (
                <span className="flex items-center gap-1">
                  <FiClock size={12} />
                  <span>{task.dueTime.toString().padStart(2, '0')}:۰۰</span>
                </span>
              )}
              
              {task.actualTime > 0 && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <FiCheckCircle size={12} />
                  <span>{formatTimeByLang(task.actualTime)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onViewDetails(task)}
            className="text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('actions.view')}
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => onStartTracking(task)}
            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('pomodoro.title')}
          >
            <FiClock size={16} />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('actions.edit')}
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('actions.delete')}
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </Card>
  )
})
TaskCard.displayName = 'TaskCard'

const TasksPage = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { tasks = [], availableTags = [] } = useSelector(state => state.tasks)
  const { projects = [] } = useSelector(state => state.projects)
  
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showTimeTracker, setShowTimeTracker] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [detailsTask, setDetailsTask] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ 
    isOpen: false, 
    taskId: null, 
    taskTitle: '' 
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterProject, setFilterProject] = useState('all')
  const [filterTag, setFilterTag] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('list')

  // ✅ useMemo: projectsById Map
  const projectsById = useMemo(() => {
    const map = new Map()
    for (const p of projects) map.set(p.id, p)
    return map
  }, [projects])

  // ✅ useMemo: tag counts (قبلاً O(n*m) بود)
  const tagCounts = useMemo(() => {
    const map = new Map()
    for (const task of tasks) {
      if (!task.tags) continue
      for (const tag of task.tags) {
        map.set(tag, (map.get(tag) || 0) + 1)
      }
    }
    return map
  }, [tasks])

  // ✅ useMemo: sorted tags
  const sortedTags = useMemo(() => {
    return [...availableTags].sort((a, b) => 
      (tagCounts.get(b) || 0) - (tagCounts.get(a) || 0)
    )
  }, [availableTags, tagCounts])

  // ✅ useMemo: filtered tasks (قبلاً در هر رندر)
  const filteredTasks = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim()
    
    return tasks.filter(task => {
      // Search
      if (lowerSearch) {
        const titleMatch = task.title?.toLowerCase().includes(lowerSearch)
        const descMatch = task.description?.toLowerCase().includes(lowerSearch)
        const tagMatch = task.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
        if (!titleMatch && !descMatch && !tagMatch) return false
      }
      
      // Status
      if (filterStatus === 'completed' && !task.completed) return false
      if (filterStatus === 'pending' && task.completed) return false
      
      // Project
      if (filterProject !== 'all' && task.projectId !== filterProject) return false
      
      // Tag
      if (filterTag !== 'all' && (!task.tags || !task.tags.includes(filterTag))) return false
      
      return true
    })
  }, [tasks, searchTerm, filterStatus, filterProject, filterTag])

  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterProject !== 'all' || filterTag !== 'all'

  // ✅ useCallback: هندلرها
  const handleToggleTask = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId)
    dispatch(toggleTaskStatus(taskId))
    
    if (task && !task.completed) {
      dispatch(onTaskCompleted({ actualTime: task.actualTime || 0 }))
    }
  }, [dispatch, tasks])

  const handleCreate = useCallback(() => {
    setEditingTask(null)
    setShowTaskForm(true)
  }, [])

  const handleEdit = useCallback((task) => {
    setEditingTask(task)
    setShowTaskForm(true)
    setShowDetails(false)
    setDetailsTask(null)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowTaskForm(false)
    setEditingTask(null)
  }, [])

  const handleViewDetails = useCallback((task) => {
    setDetailsTask(task)
    setShowDetails(true)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false)
    setDetailsTask(null)
  }, [])

  const handleDeleteTask = useCallback((task) => {
    setDeleteConfirm({ isOpen: true, taskId: task.id, taskTitle: task.title })
  }, [])

  const confirmDeleteTask = useCallback(() => {
    dispatch(deleteTask(deleteConfirm.taskId))
    toast.success(`${deleteConfirm.taskTitle} - ${t('actions.delete')}`, {
      position: "bottom-left",
      autoClose: 3000,
    })
    setDeleteConfirm({ isOpen: false, taskId: null, taskTitle: '' })
    
    if (showDetails && detailsTask?.id === deleteConfirm.taskId) {
      setShowDetails(false)
      setDetailsTask(null)
    }
  }, [dispatch, deleteConfirm, t, showDetails, detailsTask])

  const handleStartTimeTracking = useCallback((task) => {
    setSelectedTask(task)
    setShowTimeTracker(true)
  }, [])

  const handleTagClick = useCallback((tag) => {
    setFilterTag(tag)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterProject('all')
    setFilterTag('all')
  }, [])

  const getSubtaskProgress = useCallback((task) => {
    const subtasks = task.subtasks || []
    if (subtasks.length === 0) return null
    const completed = subtasks.filter(st => st.completed).length
    return {
      completed,
      total: subtasks.length,
      percentage: Math.round((completed / subtasks.length) * 100)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCheckSquare className="text-blue-600" size={26} />
            <span>{t('tasks.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('tasks.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 transition-colors text-sm flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiList size={16} />
              <span className="hidden sm:inline">{t('kanban.listView')}</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 transition-colors text-sm flex items-center gap-1.5 border-s border-gray-300 dark:border-gray-600 ${
                viewMode === 'kanban'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiColumns size={16} />
              <span className="hidden sm:inline">{t('kanban.kanbanView')}</span>
            </button>
          </div>

          <Button onClick={handleCreate}>
            <FiPlus size={16} />
            <span>{t('tasks.new')}</span>
          </Button>
        </div>
      </div>

      {/* فیلترها */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <FiSearch 
                size={16} 
                className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                placeholder={t('tasks.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pe-9"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter size={16} />
              <span className="hidden sm:inline">{t('tasks.filters')}</span>
              {showFilters ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </Button>
            {hasActiveFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                <FiX size={16} />
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('tasks.status.all')}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('tasks.status.all')}</option>
                  <option value="completed">{t('tasks.status.completed')}</option>
                  <option value="pending">{t('tasks.status.pending')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('tasks.form.project')}
                </label>
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('nav.projects')}</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('tasks.form.tags')}
                </label>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('tasks.form.tags')}</option>
                  {sortedTags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag} ({tagCounts.get(tag) || 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
            <span>{filteredTasks.length} {t('tasks.found')}</span>
            {hasActiveFilters && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                {t('tasks.activeFilters')}
              </span>
            )}
            {viewMode === 'kanban' && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full flex items-center gap-1">
                <FiColumns size={10} />
                {t('kanban.kanbanView')}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* تگ‌های پرکاربرد */}
      {availableTags.length > 0 && !showFilters && viewMode === 'list' && (
        <Card className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <FiTag size={14} />
              <span>{t('tasks.popularTags')}:</span>
            </span>
            {sortedTags.slice(0, 8).map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? 'all' : tag)}
                className={`transition-transform hover:scale-105 ${
                  filterTag === tag ? 'ring-2 ring-blue-500 rounded-md' : ''
                }`}
              >
                <TagBadge tag={tag} />
              </button>
            ))}
            {availableTags.length > 8 && (
              <span className="text-xs text-gray-400">
                +{availableTags.length - 8} {t('tasks.more')}
              </span>
            )}
          </div>
        </Card>
      )}

      {viewMode === 'kanban' ? (
        <KanbanBoard 
          onEditTask={handleEdit}
          onViewDetails={handleViewDetails}
          filteredTasks={filteredTasks}
        />
      ) : (
        <>
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                project={projectsById.get(task.projectId)}
                priorityInfo={PRIORITIES[task.priority]}
                subtaskProgress={getSubtaskProgress(task)}
                t={t}
                onToggle={handleToggleTask}
                onViewDetails={handleViewDetails}
                onStartTracking={handleStartTimeTracking}
                onEdit={handleEdit}
                onDelete={handleDeleteTask}
                onTagClick={handleTagClick}
              />
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <FiCheckSquare size={40} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {tasks.length === 0 ? t('tasks.empty') : t('tasks.noResults')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {tasks.length === 0 ? t('tasks.emptyDesc') : t('tasks.clearFilters')}
              </p>
              {tasks.length === 0 ? (
                <Button onClick={handleCreate}>
                  <FiPlus size={16} />
                  <span>{t('tasks.createFirst')}</span>
                </Button>
              ) : (
                <Button onClick={clearFilters} variant="secondary">
                  <FiX size={16} />
                  <span>{t('tasks.clearFilters')}</span>
                </Button>
              )}
            </Card>
          )}
        </>
      )}

      <Modal
  isOpen={showTaskForm}
  onClose={handleCloseForm}
  title={editingTask ? t('tasks.form.editTitle') : t('tasks.form.createTitle')}
  size="xlarge"
>
        <TaskForm onClose={handleCloseForm} editTask={editingTask} />
      </Modal>

      <TaskDetailsModal
        isOpen={showDetails}
        onClose={handleCloseDetails}
        task={detailsTask}
        onEdit={handleEdit}
      />

      <Modal
        isOpen={showTimeTracker}
        onClose={() => {
          setShowTimeTracker(false)
          setSelectedTask(null)
        }}
        title={t('pomodoro.title')}
      >
        {selectedTask && (
          <TimeTracker 
            taskId={selectedTask.id}
            onClose={() => {
              setShowTimeTracker(false)
              setSelectedTask(null)
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, taskId: null, taskTitle: '' })}
        onConfirm={confirmDeleteTask}
        title={t('actions.delete')}
        message={`${deleteConfirm.taskTitle}?`}
        confirmText={t('actions.confirm')}
        cancelText={t('actions.cancel')}
        variant="danger"
      />
    </div>
  )
}

export default memo(TasksPage)