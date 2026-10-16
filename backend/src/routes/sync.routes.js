import express from 'express'
import { push, pull, full, reset } from '../controllers/sync.controller.js'
import { pushSchema, fullSyncSchema } from '../controllers/sync.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

// ✅ همه sync routes محافظت‌شده
router.use(requireAuth)

// ═══════════════════════════════════════════════
// ✅ Sync Routes
// ═══════════════════════════════════════════════
router.post('/push', validate(pushSchema), push)
router.get('/pull', pull)
router.post('/full', validate(fullSyncSchema), full)

// ✅ Reset endpoint
router.delete('/reset', reset)

// ✅ Status endpoint (برای تست)
router.get('/status', (req, res) => {
  res.json({
    success: true,
    userId: req.userId,
    message: 'Sync ready'
  })
})

export default router