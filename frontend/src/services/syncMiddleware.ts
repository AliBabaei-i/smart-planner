import type { Middleware, AnyAction } from '@reduxjs/toolkit'
import { syncQueue } from './syncQueue'
import { ENTITY_MAP, getEntityFromAction } from './syncEntities'

const IGNORED_ACTIONS = [
  'auth/', 'theme/', 'notifications/', 'dashboard/',
  'achievements/', 'pomodoro/', '@@', 'persist/'
]

const WRITE_ACTIONS = [
  'addTask', 'updateTask', 'deleteTask', 'toggleTaskStatus',
  'addSubtask', 'updateSubtask', 'deleteSubtask', 'toggleSubtask',
  'updateTaskNotes', 'addTagToTask', 'removeTagFromTask',
  'linkTransactionToTask', 'addProject', 'updateProject', 'deleteProject',
  'addHabit', 'updateHabit', 'deleteHabit', 'toggleArchiveHabit',
  'toggleCompletion', 'addNote', 'updateNote', 'deleteNote', 'togglePinNote',
  'toggleArchiveNote', 'toggleChecklistItem', 'addGoal', 'updateGoal',
  'deleteGoal', 'toggleArchiveGoal', 'addMilestone', 'updateMilestone',
  'deleteMilestone', 'toggleMilestone', 'setGoalStatus', 'addJournal',
  'updateJournal', 'deleteJournal', 'addSkill', 'updateSkill', 'deleteSkill',
  'addSkillSession', 'deleteSkillSession', 'updateSkillLevel',
  'addAccount', 'updateAccount', 'deleteAccount', 'addTransaction',
  'updateTransaction', 'deleteTransaction', 'addPlan', 'updatePlan',
  'deletePlan', 'payPlanDue', 'addBudget', 'updateBudget', 'deleteBudget'
]

const shouldSync = (action: AnyAction): boolean => {
  if (!action || !action.type) return false
  for (const ignored of IGNORED_ACTIONS) {
    if (action.type.startsWith(ignored)) return false
  }
  const actionName = action.type.split('/')[1]
  if (!actionName) return false
  return WRITE_ACTIONS.some(name => actionName.includes(name))
}

const getEntitiesFromState = (state: any, entityName: string): any[] => {
  const config = ENTITY_MAP[entityName]
  if (!config) return []
  let current = state
  for (const path of config.statePath) {
    if (!current || typeof current !== 'object') return []
    current = current[path]
  }
  return Array.isArray(current) ? current : []
}

const filterFields = (obj: any, fields: string[]): any => {
  const result: any = {}
  for (const field of fields) {
    if (obj[field] !== undefined) {
      result[field] = obj[field]
    }
  }
  if (!result.id) result.id = obj.id
  if (!result.updatedAt) result.updatedAt = obj.updatedAt || new Date().toISOString()
  return result
}

const extractChanges = (action: AnyAction, state: any): any => {
  const entityName = getEntityFromAction(action.type)
  if (!entityName) return null

  const config = ENTITY_MAP[entityName]
  if (!config) return null

  const actionName = action.type.split('/')[1] || ''
  const payload = action.payload
  const entities = getEntitiesFromState(state, entityName)

  if (actionName.toLowerCase().includes('delete')) {
    const id = typeof payload === 'string' ? payload : payload?.id
    if (!id) return null
    return {
      entity: config.backendName,
      data: {
        id,
        updatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString()
      },
      isDelete: true
    }
  }

  if (actionName.toLowerCase().includes('add')) {
    if (entities.length === 0) return null
    const payloadTitle = payload?.title || payload?.name
    let newEntity = null

    if (payloadTitle) {
      newEntity = entities.find(e => e.title === payloadTitle || e.name === payloadTitle)
    }
    if (!newEntity) newEntity = entities[entities.length - 1]
    if (!newEntity) return null

    return {
      entity: config.backendName,
      data: filterFields(newEntity, config.fields)
    }
  }

  const id = typeof payload === 'string' ? payload : payload?.id
  if (!id) return null
  const entity = entities.find(e => e.id === id)
  if (!entity) return null

  return {
    entity: config.backendName,
    data: filterFields(entity, config.fields)
  }
}

export const syncMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action)

  if (shouldSync(action)) {
    try {
      const state = store.getState()
      const change = extractChanges(action, state)
      if (change) {
        syncQueue.add(change).catch((err) => {
          console.error('❌ [MW] Queue add failed:', err)
        })
      }
    } catch (error) {
      console.error('❌ [MW] Error:', error)
    }
  }

  return result
}

export default syncMiddleware