import { syncQueue } from './syncQueue'
import { ENTITY_MAP, getEntityFromAction } from './syncEntities'

// ═══════════════════════════════════════════════
// ✅ دیباگ: ببین middleware حتی اجرا می‌شه؟
// ═══════════════════════════════════════════════
console.log('🚀 [syncMiddleware] File loaded')

const IGNORED_ACTIONS = [
  'auth/', 'theme/', 'notifications/', 'dashboard/',
  'achievements/', 'pomodoro/', '@@', 'persist/'
]

const WRITE_ACTIONS = [
  'addTask', 'updateTask', 'deleteTask', 'toggleTaskStatus',
  'addSubtask', 'updateSubtask', 'deleteSubtask', 'toggleSubtask',
  'updateTaskNotes', 'addTagToTask', 'removeTagFromTask',
  'linkTransactionToTask',
  'addProject', 'updateProject', 'deleteProject',
  'addHabit', 'updateHabit', 'deleteHabit', 'toggleArchiveHabit',
  'toggleCompletion',
  'addNote', 'updateNote', 'deleteNote', 'togglePinNote',
  'toggleArchiveNote', 'toggleChecklistItem',
  'addGoal', 'updateGoal', 'deleteGoal', 'toggleArchiveGoal',
  'addMilestone', 'updateMilestone', 'deleteMilestone',
  'toggleMilestone', 'setGoalStatus',
  'addJournal', 'updateJournal', 'deleteJournal',
  'addSkill', 'updateSkill', 'deleteSkill',
  'addSkillSession', 'deleteSkillSession', 'updateSkillLevel',
  'addAccount', 'updateAccount', 'deleteAccount',
  'addTransaction', 'updateTransaction', 'deleteTransaction',
  'addPlan', 'updatePlan', 'deletePlan', 'payPlanDue',
  'addBudget', 'updateBudget', 'deleteBudget'
]

const shouldSync = (action) => {
  if (!action || !action.type) return false
  for (const ignored of IGNORED_ACTIONS) {
    if (action.type.startsWith(ignored)) return false
  }
  const actionName = action.type.split('/')[1]
  if (!actionName) return false
  return WRITE_ACTIONS.some(name => actionName.includes(name))
}

// ✅ گرفتن entities از state
const getEntitiesFromStateFromState = (state, entityName) => {
  const config = ENTITY_MAP[entityName]
  if (!config) return []
  let current = state
  for (const path of config.statePath) {
    if (!current || typeof current !== 'object') return []
    current = current[path]
  }
  return Array.isArray(current) ? current : []
}

// ✅ فیلتر فیلدها
const filterFields = (obj, fields) => {
  const result = {}
  for (const field of fields) {
    if (obj[field] !== undefined) {
      result[field] = obj[field]
    }
  }
  if (!result.id) result.id = obj.id
  if (!result.updatedAt) result.updatedAt = obj.updatedAt || new Date().toISOString()
  return result
}

// ═══════════════════════════════════════════════
// ✅ استخراج تغییرات (نسخه اصلاح‌شده)
// ═══════════════════════════════════════════════
const extractChanges = (action, state) => {
  const entityName = getEntityFromAction(action.type)
  if (!entityName) return null

  const config = ENTITY_MAP[entityName]
  if (!config) return null

  const actionName = action.type.split('/')[1] || ''
  const payload = action.payload
  const entities = getEntitiesFromStateFromState(state, entityName)

  // ✅ حالت DELETE
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

  // ✅ حالت ADD — پیدا کردن entity جدید در state
  if (actionName.toLowerCase().includes('add')) {
    if (entities.length === 0) return null

    const payloadTitle = payload?.title || payload?.name
    let newEntity = null

    if (payloadTitle) {
      newEntity = entities.find(e =>
        e.title === payloadTitle || e.name === payloadTitle
      )
    }

    if (!newEntity) {
      newEntity = entities[entities.length - 1]
    }

    if (!newEntity) return null

    return {
      entity: config.backendName,
      data: filterFields(newEntity, config.fields)
    }
  }

  // ✅ حالت UPDATE/TOGGLE — با id پیدا کن
  const id = typeof payload === 'string' ? payload : payload?.id
  if (!id) return null

  const entity = entities.find(e => e.id === id)
  if (!entity) return null

  return {
    entity: config.backendName,
    data: filterFields(entity, config.fields)
  }
}

// ═══════════════════════════════════════════════
// ✅ Middleware
// ═══════════════════════════════════════════════
export const syncMiddleware = (store) => (next) => (action) => {
  // ✅ دیباگ
  if (action.type && !action.type.startsWith('@@')) {
    console.log('🔍 [MW] Action:', action.type, '| shouldSync:', shouldSync(action))
  }

  const result = next(action)

  if (shouldSync(action)) {
    try {
      const state = store.getState()
      const change = extractChanges(action, state)
      console.log('🎯 [MW] Extracted:', change)

      if (change) {
        // ✅ fire-and-forget (IndexedDB async)
        syncQueue.add(change)
          .then(() => {
            console.log('📝 [MW] Queued for sync:', change.entity, change.data?.id)
          })
          .catch((err) => {
            console.error('❌ [MW] Queue add failed:', err)
          })
      } else {
        console.warn('⚠️ [MW] shouldSync=true but extractChanges returned null')
      }
    } catch (error) {
      console.error('❌ [MW] Error:', error)
    }
  }

  return result
}
export default syncMiddleware   