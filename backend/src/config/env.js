import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const required = ['JWT_SECRET']
const missing = required.filter(key => !process.env[key])

if (missing.length > 0) {
  console.error('❌ Missing environment variables:', missing.join(', '))
  console.error('👉 Copy .env.example to .env and fill the values')
  process.exit(1)
}

export const config = {
  port: parseInt(process.env.PORT) || 4000,
  env: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '90d'
  },

  db: {
    path: process.env.DB_PATH || './data/smart-planner.db'
  },

  cors: {
     origin: process.env.NODE_ENV === 'development'
      ? /^http:\/\/localhost:\d+$/
      : (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim())
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
  }
}

export default config