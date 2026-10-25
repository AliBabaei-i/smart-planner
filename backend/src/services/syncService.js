import { get, all, run, transaction } from '../db/index.js'
import { SYNC_ENTITIES } from '../config/syncEntities.js'
import logger from '../utils/logger.js'

// ═══════════════════════════════════════════════
// ✅ snake_case → camelCase
// ═══════════════════════════════════════════════
const toCamel = (str) => str.replace(/_([a-z])/g, (_, l) => l.toUpperCase())

// ═══════════════════════════════════════════════
// ✅ Normalize data before DB write (camelCase → snake_case)
// ═══════════════════════════════════════════════
const normalizeForDb = (entityConfig, data) => {
  const result = {}

  for (const col of entityConfig.columns) {
    let value = data[col]

    // اگه نبود، camelCase رو امتحان کن
    if (value === undefined) {
      const camelKey = toCamel(col)
      value = data[camelKey]
    }

    if (value === undefined) {
      value = null
    } else if (entityConfig.jsonColumns.includes(col)) {
      value = typeof value === 'string' ? value : JSON.stringify(value || [])
    } else if (entityConfig.booleanColumns.includes(col)) {
      value = value ? 1 : 0
    }

    result[col] = value
  }

  // ✅ DEFENSIVE: created_at و updated_at هرگز null نباشند
  const now = new Date().toISOString()
  if (entityConfig.columns.includes('created_at') && !result.created_at) {
    result.created_at = result.updated_at || now
  }
  if (entityConfig.columns.includes('updated_at') && !result.updated_at) {
    result.updated_at = now
  }

  return result
}

// ═══════════════════════════════════════════════
// ✅ Normalize from DB to client (snake_case → camelCase)
// ═══════════════════════════════════════════════
const normalizeFromDb = (entityConfig, row) => {
  const result = {}

  for (const col of entityConfig.columns) {
    const camelKey = toCamel(col)
    let value = row[col]

    // JSON columns
    if (entityConfig.jsonColumns.includes(col)) {
      if (value) {
        try {
          value = JSON.parse(value)
        } catch {
          value = []
        }
      } else {
        value = []
      }
    }

    // Boolean columns
    if (entityConfig.booleanColumns.includes(col)) {
      value = !!value
    }

    result[camelKey] = value
  }

  return result
}

// ═══════════════════════════════════════════════
// ✅ Required Fields per Entity
// ═══════════════════════════════════════════════
const REQUIRED_FIELDS = {
  tasks: ['title'],
  projects: ['name'],
  habits: ['name'],
  notes: [],
  goals: ['title'],
  journals: [],
  skills: ['name'],
  financeAccounts: ['name'],
  financeTransactions: ['account_id', 'type', 'amount'],
  financePlans: ['title', 'total_amount'],
  financePlanDues: ['plan_id', 'due_index'],
  financeBudgets: ['category', 'amount'],
}

const validateEntity = (entityName, normalized) => {
  if (normalized.deleted_at) return null
  const required = REQUIRED_FIELDS[entityName] || []
  for (const field of required) {
    const val = normalized[field]
    if (val === null || val === undefined || val === '') {
      return `Field "${field}" is required for ${entityName}`
    }
  }
  return null
}

// ═══════════════════════════════════════════════
// ✅ UPSERT / DELETE یک entity
// ═══════════════════════════════════════════════
const upsertEntity = (userId, entityName, data) => {
  const config = SYNC_ENTITIES[entityName]
  if (!config) {
    throw new Error(`Unknown entity: ${entityName}`)
  }

  const normalized = normalizeForDb(config, data)
  normalized.user_id = userId

  const isDelete = !!normalized.deleted_at

  // ─── DELETE (Soft Delete) ───
  if (isDelete) {
    const existing = get(
      `SELECT id FROM ${config.table} WHERE id = ? AND user_id = ?`,
      [normalized.id, userId]
    )
    if (!existing) {
      return { success: true, changes: 0, note: 'delete-noop' }
    }
    const result = run(
      `UPDATE ${config.table}
       SET deleted_at = ?, updated_at = ?
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [normalized.deleted_at, normalized.updated_at, normalized.id, userId]
    )
    return { success: true, changes: result.changes }
  }

  // ─── UPSERT ───
  const validationError = validateEntity(entityName, normalized)
  if (validationError) {
    return { success: false, error: validationError, skipped: true }
  }

  const columns = ['user_id', ...config.columns]
  const placeholders = columns.map(() => '?').join(', ')
  const updateClauses = config.columns
    .filter((c) => c !== 'id')
    .map((c) => `${c} = excluded.${c}`)
    .join(', ')

  const sql = `
    INSERT INTO ${config.table} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT(id) DO UPDATE SET
      ${updateClauses}
    WHERE excluded.updated_at > ${config.table}.updated_at
  `

  const values = columns.map((col) => normalized[col])

  try {
    const result = run(sql, values)
    return { success: true, changes: result.changes }
  } catch (error) {
    logger.error(`UPSERT failed for ${entityName}:`, error.message)
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════
// ✅ Push
// ═══════════════════════════════════════════════
export const pushChanges = (userId, changes) => {
  const results = { applied: 0, conflicts: 0, skipped: 0, errors: [] }

  transaction(() => {
    for (const change of changes) {
      const { entity, data } = change
      try {
        const result = upsertEntity(userId, entity, data)
        if (result.success) {
          if (result.changes === 0) {
            results.conflicts++
          } else {
            results.applied++
          }
        } else if (result.skipped) {
          results.skipped++
          logger.warn(`Skipped ${entity}: ${result.error}`)
        } else {
          results.errors.push({ entity, error: result.error })
        }
      } catch (error) {
        logger.error(`Push failed for ${entity}:`, error.message)
        results.errors.push({ entity, error: error.message })
      }
    }
  })

  return results
}

// ═══════════════════════════════════════════════
// ✅ Pull
// ═══════════════════════════════════════════════
export const pullChanges = (userId, since = null) => {
  const sinceTime = since || '1970-01-01T00:00:00.000Z'
  const serverTime = new Date().toISOString()
  const entities = {}

  for (const [entityName, config] of Object.entries(SYNC_ENTITIES)) {
    try {
      const rows = all(
        `SELECT * FROM ${config.table}
         WHERE user_id = ? AND updated_at > ?
         ORDER BY updated_at ASC`,
        [userId, sinceTime]
      )
      entities[entityName] = rows.map((row) => normalizeFromDb(config, row))
    } catch (error) {
      logger.error(`Pull failed for ${entityName}:`, error.message)
      entities[entityName] = []
    }
  }

  return { serverTime, entities }
}

// ═══════════════════════════════════════════════
// ✅ Full Sync
// ═══════════════════════════════════════════════
export const fullSync = (userId, changes, since) => {
  const pushResult =
    changes && changes.length > 0
      ? pushChanges(userId, changes)
      : { applied: 0, conflicts: 0, skipped: 0, errors: [] }

  const pullResult = pullChanges(userId, since)

  return { push: pushResult, pull: pullResult }
}

// ═══════════════════════════════════════════════
// ✅ Reset
// ═══════════════════════════════════════════════
export const resetUserData = (userId, entityName = null) => {
  const results = {}
  const entitiesToReset = entityName
    ? { [entityName]: SYNC_ENTITIES[entityName] }
    : SYNC_ENTITIES

  if (entityName && !SYNC_ENTITIES[entityName]) {
    throw new Error(`Unknown entity: ${entityName}`)
  }

  const now = new Date(Date.now() + 1000).toISOString()

  transaction(() => {
    for (const [name, config] of Object.entries(entitiesToReset)) {
      try {
        const result = run(
          `UPDATE ${config.table}
           SET deleted_at = ?, updated_at = ?
           WHERE user_id = ? AND deleted_at IS NULL`,
          [now, now, userId]
        )
        results[name] = result.changes || 0
      } catch (error) {
        logger.error(`Reset failed for ${name}:`, error.message)
        results[name] = -1
      }
    }
  })

  return results
}

export default { pushChanges, pullChanges, fullSync, resetUserData }