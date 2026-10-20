import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiCalendar, FiCheckCircle, FiCircle, FiArrowLeft } from 'react-icons/fi'
import type { RootState } from '../../app/store'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
const TodayTasksWidget: React.FC = () => {
  const { t } = useTranslation()
  const { tasks = [] } = useSelector((s: RootState) => s.tasks)
  const { projects = [] } = useSelector((s: RootState) => s.projects)

  const today = new Date().toDateString()
  const todayTasks = tasks
    .filter((x) => x.dueDate && new Date(x.dueDate).toDateString() === today)
    .sort((a, b) => (a.dueTime || 0) - (b.dueTime || 0))
  const completedToday = todayTasks.filter((x) => x.completed).length

  if (todayTasks.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
          <FiCalendar size={24} className="text-blue-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{t('planning.empty')}</p>
        <Link to="/planning" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline">
          <span>{t('nav.planning')}</span><FiArrowLeft size={12} />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600 dark:text-gray-400">{completedToday} {t('achievements.of')} {todayTasks.length}</span>
        <span className="font-medium text-gray-900 dark:text-white">{Math.round((completedToday / todayTasks.length) * 100)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div className="bg-gradient-to-l from-green-500 to-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(completedToday / todayTasks.length) * 100}%` }} />
      </div>
      <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin">
        {todayTasks.slice(0, 5).map((task) => {
          const project = projects.find((p) => p.id === task.projectId)
          return (
            <div key={task.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
              {task.completed ? <FiCheckCircle className="text-green-500 flex-shrink-0" size={14} /> : <FiCircle className="text-gray-400 flex-shrink-0" size={14} />}
              {task.dueTime !== null && task.dueTime !== undefined && (
                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5 flex-shrink-0">
                  {String(task.dueTime).padStart(2, '0')}:۰۰
                </span>
              )}
              <span className={`flex-1 text-xs truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{task.title}</span>
              {project && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />}
            </div>
          )
        })}
        {todayTasks.length > 5 && (
          <Link to="/tasks" className="text-center text-[10px] text-blue-600 dark:text-blue-400 hover:underline block pt-1">
            + {todayTasks.length - 5} {t('tasks.more')}
          </Link>
        )}
      </div>
    </div>
  )
}

export default TodayTasksWidget