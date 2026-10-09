import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiFolder, FiArrowLeft } from 'react-icons/fi'

const ProjectProgressWidget = () => {
  const { t } = useTranslation()
  const { projects = [] } = useSelector(state => state.projects)
  const { tasks = [] } = useSelector(state => state.tasks)

  const projectsWithProgress = projects.map(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id)
    const completed = projectTasks.filter(t => t.completed).length
    const progress = projectTasks.length > 0 
      ? Math.round((completed / projectTasks.length) * 100) 
      : 0
    return { ...project, total: projectTasks.length, completed, progress }
  }).filter(p => p.total > 0)

  if (projectsWithProgress.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
          <FiFolder size={28} className="text-blue-400" />
        </div>
        <p className="text-sm">{t('projects.empty')}</p>
        <Link 
          to="/projects"
          className="inline-flex items-center space-x-1 space-x-reverse text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline mt-2"
        >
          <span>{t('projects.createFirst')}</span>
          <FiArrowLeft size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {projectsWithProgress.map(project => (
        <div key={project.id} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: project.color }}
              ></div>
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                {project.name}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {project.completed}/{project.total} ({project.progress}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full transition-all"
              style={{ 
                width: `${project.progress}%`,
                backgroundColor: project.color
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectProgressWidget