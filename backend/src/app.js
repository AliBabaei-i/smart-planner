import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import config from './config/env.js'
import logger from './utils/logger.js'
import { generalLimiter } from './middleware/rateLimit.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const app = express()

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

app.use(cors({
  origin: config.isDev 
    ? [config.cors.clientUrl, 'http://localhost:5173', 'http://localhost:3000']
    : config.cors.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api', generalLimiter)

if (config.isDev) {
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      logger.request(req.method, req.originalUrl, res.statusCode, duration)
    })
    next()
  })
}

app.use('/api', routes)

app.get('/', (req, res) => {
  res.json({
    name: 'Smart Planner API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health'
  })
})

app.use(notFound)
app.use(errorHandler)

export default app