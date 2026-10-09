import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { 
  FiFolder, 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2,
  FiTrendingUp,
  FiCheckCircle,
  FiList,
  FiX
} from 'react-icons/fi'
import { deleteProject } from './projectsSlice'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ProjectForm from './ProjectForm'
import { formatDateByLang } from '../../utils/formatters'

const ProjectsPage = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { projects = [] } = useSelector(state => state.projects)
  const { tasks = [] } = useSelector(state => state.tasks)
  
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ 
    isOpen: false, 
    projectId: null, 
    projectName: '', 
    taskCount: 0 
  })
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setEditingProject(null)
    setShowProjectForm(true)
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setShowProjectForm(true)
  }

  const handleCloseForm = () => {
    setShowProjectForm(false)
    setEditingProject(null)
  }

  const handleDeleteProject = (project) => {
    const projectTasks = tasks.filter(task => task.projectId === project.id)
    setDeleteConfirm({
      isOpen: true,
      projectId: project.id,
      projectName: project.name,
      taskCount: projectTasks.length
    })
  }

  const confirmDeleteProject = () => {
    dispatch(deleteProject(deleteConfirm.projectId))
    toast.success(`${deleteConfirm.projectName} - ${t('actions.delete')}`, {
      position: "bottom-left",
      autoClose: 3000,
    })
    setDeleteConfirm({ isOpen: false, projectId: null, projectName: '', taskCount: 0 })
  }

  const getProjectStats = (projectId) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId)
    const completedTasks = projectTasks.filter(task => task.completed).length
    const totalTime = projectTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0)
    
    return {
      totalTasks: projectTasks.length,
      completedTasks,
      completionRate: projectTasks.length > 0 
        ? Math.round((completedTasks / projectTasks.length) * 100) 
        : 0,
      totalTime
    }
  }

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiFolder className="text-blue-600" size={26} />
            <span>{t('projects.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('projects.subtitle')}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <FiPlus size={16} />
          <span>{t('projects.new')}</span>
        </Button>
      </div>

      {/* جستجو */}
      {projects.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <FiSearch 
                size={16} 
                className="absolute end-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                placeholder={`${t('actions.search')}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pe-9"
              />
            </div>
            {searchTerm && (
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => setSearchTerm('')}
              >
                <FiX size={14} />
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* شبکه پروژه‌ها */}
      {filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => {
            const stats = getProjectStats(project.id)
            
            return (
              <Card key={project.id} className="p-5 hover:shadow-lg transition-all group">
                {/* هدر پروژه */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: `${project.color}20` }}
                    >
                      <FiFolder 
                        size={20} 
                        style={{ color: project.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {project.name}
                      </h3>
                      <div 
                        className="w-8 h-1 rounded-full mt-1"
                        style={{ backgroundColor: project.color }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={t('actions.edit')}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={t('actions.delete')}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* آمار */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <FiList size={14} />
                      <span>{t('projects.stats.total')}</span>
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stats.totalTasks}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <FiCheckCircle size={14} />
                      <span>{t('projects.stats.completed')}</span>
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {stats.completedTasks}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <FiTrendingUp size={14} />
                      <span>{t('projects.stats.progress')}</span>
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stats.completionRate}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {stats.totalTasks > 0 && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3 overflow-hidden">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats.completionRate}%`,
                        backgroundColor: project.color
                      }}
                    ></div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span>{formatDateByLang(project.createdAt)}</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    stats.completionRate === 100
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : stats.completionRate >= 50
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {stats.completionRate}%
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* حالت خالی */}
      {projects.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <FiFolder size={40} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('projects.empty')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('projects.emptyDesc')}
          </p>
          <Button onClick={handleCreate}>
            <FiPlus size={16} />
            <span>{t('projects.createFirst')}</span>
          </Button>
        </Card>
      )}

      {projects.length > 0 && filteredProjects.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <FiSearch size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('tasks.noResults')}
          </h3>
          <Button variant="secondary" onClick={() => setSearchTerm('')}>
            <FiX size={14} />
            <span>{t('tasks.clearFilters')}</span>
          </Button>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={showProjectForm}
        onClose={handleCloseForm}
        title={editingProject ? t('projects.form.editTitle') : t('projects.form.createTitle')}
      >
        <ProjectForm 
          onClose={handleCloseForm}
          editProject={editingProject}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ 
          isOpen: false, 
          projectId: null, 
          projectName: '', 
          taskCount: 0 
        })}
        onConfirm={confirmDeleteProject}
        title={t('actions.delete')}
        message={`${deleteConfirm.projectName}${deleteConfirm.taskCount > 0 ? ` (${deleteConfirm.taskCount} ${t('nav.tasks')})` : ''}`}
        confirmText={t('actions.confirm')}
        cancelText={t('actions.cancel')}
        variant="danger"
        icon="🗑️"
      />
    </div>
  )
}

export default ProjectsPage