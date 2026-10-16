import express from 'express'
import authRoutes from './auth.routes.js'
import syncRoutes from './sync.routes.js'

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

router.use('/auth', authRoutes)
router.use('/sync', syncRoutes)

export default router