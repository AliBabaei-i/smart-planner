import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import type { IconType } from 'react-icons'
import {
  FiClock,
  FiCalendar,
  FiEdit2,
  FiEye,
  FiFlag,
  FiRepeat,
  FiList,
  FiCircle,
  FiCheckCircle,
  FiPlay,
  FiInbox,
} from 'react-icons/fi'
import { updateTask, toggleTaskStatus } from './tasksSlice'
import { onTaskCompleted } from '../achievements/achievementsSlice'
import TagBadge from './TagBadge'
import { formatTimeByLang, formatDateByLang } from '../../utils/formatters'
import { PRIORITIES } from '../../constants/priorities'
import type { RootState, AppDispatch } from '../../app/store'

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  description?: string
  projectId: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  status?: string
  dueDate?: string | null
  dueTime?: number | null
  actualTime?: number
  tags?: string[]
  subtasks?: Subtask[]
  recurring?: string | null
}

interface Column {
  id: 'todo' | 'in-progress' | 'completed'
  labelKey: string
  color: 'gray' | 'blue' | 'green'
  Icon: IconType
}

interface KanbanBoardProps {
  onEditTask?: (task: Task) => void
  onViewDetails?: (task: Task) => void
  filteredTasks?: Task[]
}

const COLUMNS: Column[] = [
  { id: 'todo', labelKey: 'kanban.todo', color: 'gray', Icon: FiInbox },
  { id: 'in-progress', labelKey: 'kanban.inProgress', color: 'blue', Icon: FiPlay },
  { id: 'completed', labelKey: 'kanban.done', color: 'green', Icon: FiCheckCircle },
]

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onEditTask,
  onViewDetails,
  filteredTasks,
}) => {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { tasks = [] } = useSelector((s: RootState) => s.tasks)
  const { projects = [] } = useSelector((s: RootState) => s.projects)

  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const allTasks: Task[] = filteredTasks || (tasks as Task[])

  const getTasksByStatus = (status: string): Task[] => {
    return allTasks.filter((task) => {
      if (status === 'completed') return task.completed === true
      if (status === 'in-progress') return task.status === 'in-progress' && !task.completed
      return task.status !== 'in-progress' && !task.completed
    })
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
    setTimeout(() => {
      ;(e.target as HTMLElement).classList.add('dragging')
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    ;(e.target as HTMLElement).classList.remove('dragging')
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    if (!draggedTask) return

    const task = draggedTask
    const isCurrentlyCompleted = task.completed
    const isCurrentlyInProgress = task.status === 'in-progress'

    if (columnId === 'completed' && isCurrentlyCompleted) return
    if (columnId === 'in-progress' && isCurrentlyInProgress && !isCurrentlyCompleted) return
    if (columnId === 'todo' && !isCurrentlyCompleted && !isCurrentlyInProgress) return

    try {
      if (columnId === 'completed') {
        if (!task.completed) {
          dispatch(toggleTaskStatus(task.id))
          dispatch(onTaskCompleted({ actualTime: task.actualTime || 0 }))
          toast.success(`"${task.title}" ✅ ${t('kanban.completed')}`, {
            position: 'bottom-left',
            autoClose: 2000,
          })
        }
      } else if (columnId === 'in-progress') {
        if (task.completed) {
          dispatch(toggleTaskStatus(task.id))
        }
        dispatch(updateTask({ id: task.id, status: 'in-progress' }))
        toast.info(`"${task.title}" 🔄 ${t('kanban.started')}`, {
          position: 'bottom-left',
          autoClose: 2000,
        })
      } else if (columnId === 'todo') {
        if (task.completed) {
          dispatch(toggleTaskStatus(task.id))
        }
        dispatch(updateTask({ id: task.id, status: 'todo' }))
        toast.info(`"${task.title}" 📋 ${t('kanban.moved')}`, {
          position: 'bottom-left',
          autoClose: 2000,
        })
      }
    } catch (error) {
      console.error('Error moving task:', error)
      toast.error(t('errors.error'), { position: 'bottom-left', autoClose: 3000 })
    }
  }

  const getColumnStyles = (color: Column['color']) => {
    const styles = {
      gray: {
        headerBg: 'bg-gray-100 dark:bg-gray-700',
        headerText: 'text-gray-700 dark:text-gray-300',
        headerIcon: 'text-gray-500',
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        border: 'border-gray-300 dark:border-gray-600',
      },
      blue: {
        headerBg: 'bg-blue-100 dark:bg-blue-900/30',
        headerText: 'text-blue-700 dark:text-blue-300',
        headerIcon: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50/50 dark:bg-blue-900/10',
        border: 'border-blue-300 dark:border-blue-700',
      },
      green: {
        headerBg: 'bg-green-100 dark:bg-green-900/30',
        headerText: 'text-green-700 dark:text-green-300',
        headerIcon: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50/50 dark:bg-green-900/10',
        border: 'border-green-300 dark:border-green-700',
      },
    }
    return styles[color] || styles.gray
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((column) => {
        const columnTasks = getTasksByStatus(column.id)
        const IconComponent = column.Icon
        const styles = getColumnStyles(column.color)
        const isDragOver = dragOverColumn === column.id

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`kanban-column rounded-xl border-2 transition-all min-h-[500px] flex flex-col ${styles.bg} ${styles.border} ${
              isDragOver
                ? 'drag-over border-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-[1.02]'
                : ''
            }`}
          >
            <div
              className={`p-4 rounded-t-xl ${styles.headerBg} flex items-center justify-between`}
            >
              <div className="flex items-center gap-2">
                <IconComponent size={18} className={styles.headerIcon} />
                <h3 className={`font-bold text-sm ${styles.headerText}`}>
                  {t(column.labelKey)}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium bg-white dark:bg-gray-800 ${styles.headerText}`}
                >
                  {columnTasks.length}
                </span>
              </div>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-thin max-h-[600px]">
              {columnTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                  <IconComponent size={32} className="mx-auto mb-2 opacity-30" />
                  <p>{t('kanban.emptyColumn')}</p>
                  <p className="text-xs mt-1">{t('kanban.dragHere')}</p>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId)
                  const priorityInfo = PRIORITIES[task.priority]
                  const subtasks = task.subtasks || []
                  const completedSubtasks = subtasks.filter((st) => st.completed).length

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className="kanban-card bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group cursor-grab active:cursor-grabbing"
                    >
                      {project && (
                        <div
                          className="w-full h-1 rounded-full mb-2"
                          style={{ backgroundColor: project.color }}
                        />
                      )}

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4
                          className={`font-medium text-sm flex-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                            task.completed
                              ? 'line-through text-gray-400 dark:text-gray-500'
                              : 'text-gray-900 dark:text-white'
                          }`}
                          onClick={() => onViewDetails?.(task)}
                        >
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => onViewDetails?.(task)}
                            className="text-gray-400 hover:text-purple-500 p-1 rounded"
                            title={t('actions.view')}
                          >
                            <FiEye size={12} />
                          </button>
                          <button
                            onClick={() => onEditTask?.(task)}
                            className="text-gray-400 hover:text-blue-500 p-1 rounded"
                            title={t('actions.edit')}
                          >
                            <FiEdit2 size={12} />
                          </button>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {task.tags.slice(0, 3).map((tag) => (
                            <TagBadge key={tag} tag={tag} />
                          ))}
                          {task.tags.length > 3 && (
                            <span className="text-xs text-gray-400 px-1">
                              +{task.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {subtasks.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <FiList size={10} />
                          <span>
                            {completedSubtasks}/{subtasks.length}
                          </span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full"
                              style={{
                                width: `${(completedSubtasks / subtasks.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${priorityInfo.bgColor} ${priorityInfo.color} flex items-center gap-1`}
                          >
                            <FiFlag size={8} />
                            <span>{t(`tasks.priority.${task.priority}`)}</span>
                          </span>

                          {task.recurring && (
                            <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                              <FiRepeat size={10} />
                            </span>
                          )}

                          {task.dueDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <FiCalendar size={10} />
                              <span>{formatDateByLang(task.dueDate)}</span>
                            </span>
                          )}

                          {task.dueTime !== null && task.dueTime !== undefined && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <FiClock size={10} />
                              <span>{task.dueTime.toString().padStart(2, '0')}:۰۰</span>
                            </span>
                          )}
                        </div>

                        {task.actualTime !== undefined && task.actualTime > 0 && (
                          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                            <FiClock size={10} />
                            {formatTimeByLang(task.actualTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default KanbanBoard