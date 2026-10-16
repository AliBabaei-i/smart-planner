import { z } from 'zod'
import { pushChanges, pullChanges, fullSync, resetUserData } from '../services/syncService.js'
import { invalidateAllSessions } from '../services/authService.js'
import logger from '../utils/logger.js'

// ═══════════════════════════════════════════════
// ✅ Validation Schemas
// ═══════════════════════════════════════════════
export const pushSchema = z.object({
  body: z.object({
    changes: z.array(
      z.object({
        entity: z.string().min(1),
        data: z.object({
          id: z.string().min(1),
          updated_at: z.string().min(1),
        }).passthrough()
      })
    ).max(1000)
  })
})

export const fullSyncSchema = z.object({
  body: z.object({
    changes: z.array(z.any()).max(1000).optional().default([]),
    since: z.string().nullable().optional()
  })
})

// ═══════════════════════════════════════════════
// ✅ POST /api/sync/push
// ═══════════════════════════════════════════════
export const push = async (req, res, next) => {
  try {
    const { changes } = req.body
    const userId = req.userId

    logger.info(`📥 Push: ${changes.length} changes from user ${userId}`)

    const result = pushChanges(userId, changes)

    logger.success(
      `✅ Push done: ${result.applied} applied, ${result.conflicts} conflicts, ${result.errors.length} errors`
    )

    res.json({ success: true, ...result })
  } catch (error) {
    logger.error('Push error:', error.message)
    next(error)
  }
}

// ═══════════════════════════════════════════════
// ✅ GET /api/sync/pull?since=xxx
// ═══════════════════════════════════════════════
export const pull = async (req, res, next) => {
  try {
    const since = req.query.since || null
    const userId = req.userId

    logger.info(`📤 Pull: since ${since || 'beginning'} for user ${userId}`)

    const result = pullChanges(userId, since)

    const totalChanges = Object.values(result.entities)
      .reduce((sum, arr) => sum + arr.length, 0)

    logger.success(`✅ Pull done: ${totalChanges} changes sent`)

    res.json({ success: true, ...result })
  } catch (error) {
    logger.error('Pull error:', error.message)
    next(error)
  }
}

// ═══════════════════════════════════════════════
// ✅ POST /api/sync/full
// ═══════════════════════════════════════════════
export const full = async (req, res, next) => {
  try {
    const { changes = [], since = null } = req.body
    const userId = req.userId

    logger.info(`🔄 Full sync for user ${userId}`)

    const result = fullSync(userId, changes, since)

    logger.success(
      `✅ Full sync done: pushed ${result.push.applied}, pulled ${
        Object.values(result.pull.entities).reduce((s, a) => s + a.length, 0)
      }`
    )

    res.json({ success: true, ...result })
  } catch (error) {
    logger.error('Full sync error:', error.message)
    next(error)
  }
}

// ═══════════════════════════════════════════════
// ✅ DELETE /api/sync/reset?entity=xxx
// ═══════════════════════════════════════════════
export const reset = async (req, res, next) => {
  try {
    const userId = req.userId
    const entity = req.query.entity || null

    logger.warn(
      `🗑️ Reset requested for user ${userId}${entity ? ` (entity: ${entity})` : ' (ALL)'}`
    )

    // ✅ ۱. Soft-delete داده‌ها
    const result = resetUserData(userId, entity)

    // ✅ ۲. اگه reset همه بود → همه sessionها رو باطل کن
    // (fire & forget — منتظر جوابش نمی‌مونیم)
    if (!entity) {
      invalidateAllSessions(userId)
    }

    const totalDeleted = Object.values(result)
      .filter(v => v > 0)
      .reduce((sum, v) => sum + v, 0)

    logger.success(`✅ Reset done: ${totalDeleted} records marked as deleted`)

    res.json({
      success: true,
      entity: entity || 'all',
      deleted: result,
      totalDeleted,
      sessionsInvalidated: !entity
    })
  } catch (error) {
    logger.error('Reset error:', error.message)
    next(error)
  }
}

export default { push, pull, full, reset }