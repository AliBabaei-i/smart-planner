import express from 'express'
import cors from 'cors'
import config from './config/env.js'
import logger from './utils/logger.js'
import authRoutes from './routes/auth.routes.js'
import syncRoutes from './routes/sync.routes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import marketRoutes from './routes/market.routes.js'

// ═══════════════════════════════════════════════
// ✅ Express App
// ═══════════════════════════════════════════════
const app = express()

app.set('trust proxy', 1)
app.use('/api/market', cors({ origin: true }), marketRoutes)

// ═══════════════════════════════════════════════
// ✅ CORS
// ═══════════════════════════════════════════════
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)

    if (config.env === 'development') {
      const localhostRegex = /^http:\/\/localhost:\d+$/
      const localhostIPRegex = /^http:\/\/127\.0\.0\.1:\d+$/
      if (localhostRegex.test(origin) || localhostIPRegex.test(origin)) {
        return callback(null, true)
      }
    }

    const allowedOrigins = (config.cors?.origin || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (allowedOrigins.includes(origin)) return callback(null, true)
    if (config.cors?.origin === origin) return callback(null, true)

    logger.warn(`🚫 CORS blocked: ${origin}`)
    callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// ═══════════════════════════════════════════════
// ✅ Body Parsers
// ═══════════════════════════════════════════════
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ═══════════════════════════════════════════════
// ✅ Request Logger (فقط development)
// ═══════════════════════════════════════════════
if (config.env === 'development') {
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      const statusColor =
        res.statusCode >= 500 ? '\x1b[31m' :
        res.statusCode >= 400 ? '\x1b[33m' :
        res.statusCode >= 300 ? '\x1b[36m' :
        '\x1b[32m'
      const reset = '\x1b[0m'
      console.log(
        `  ${statusColor}${res.statusCode}${reset} ` +
        `${req.method.padEnd(6)} ${req.originalUrl} ` +
        `\x1b[90m${duration}ms\x1b[0m`
      )
    })
    next()
  })
}

// ═══════════════════════════════════════════════
// ✅ Health Check
// ═══════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: config.env,
    version: '2.0.0'
  })
})

// ═══════════════════════════════════════════════
// ✅ API Routes
// ═══════════════════════════════════════════════
app.use('/api/auth', authRoutes)
app.use('/api/sync', syncRoutes)

// ═══════════════════════════════════════════════
// ✅ 404 + Error Handler
// ═══════════════════════════════════════════════
app.use(notFound)
app.use(errorHandler)

// ═══════════════════════════════════════════════
// ✅ Start Server — فقط در غیر تست
// (توی تست، supertest خودش app رو مدیریت می‌کنه)
// ═══════════════════════════════════════════════
if (config.env !== 'test') {
  const PORT = config.port || 4000

  const server = app.listen(PORT, () => {
    logger.success(`🚀 Server running on http://localhost:${PORT}`)
    logger.info(`📦 Environment: ${config.env}`)
    logger.info(`🌐 CORS origin: ${config.cors?.origin || 'default'}`)
    logger.info('')
    logger.info('📋 Available endpoints:')
    logger.info(`   GET  http://localhost:${PORT}/api/health`)
    logger.info(`   POST http://localhost:${PORT}/api/auth/signup`)
    logger.info(`   POST http://localhost:${PORT}/api/auth/signin`)
    logger.info(`   POST http://localhost:${PORT}/api/auth/refresh`)
    logger.info(`   GET  http://localhost:${PORT}/api/auth/me`)
    logger.info(`   POST http://localhost:${PORT}/api/sync/push`)
    logger.info(`   GET  http://localhost:${PORT}/api/sync/pull`)
    logger.info(`   POST http://localhost:${PORT}/api/sync/full`)
    logger.info(`   DELETE http://localhost:${PORT}/api/sync/reset`)
    logger.info('')
  })

  const shutdown = (signal) => {
    logger.warn(`\n${signal} received — shutting down gracefully...`)
    server.close(() => {
      logger.info('✅ HTTP server closed')
      process.exit(0)
    })
    setTimeout(() => {
      logger.error('⚠️ Forced shutdown after timeout')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  })
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error)
    shutdown('uncaughtException')
  })
}

export default app