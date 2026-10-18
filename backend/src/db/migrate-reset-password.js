import { run, get } from './index.js'
import logger from '../utils/logger.js'

const migrate = () => {
  try {
    // اضافه کردن ستون‌ها (اگه وجود داشته باشن، خطا نمی‌ده با try/catch)
    try {
      run(`ALTER TABLE users ADD COLUMN reset_token TEXT DEFAULT NULL`)
      logger.success('✅ Added reset_token column')
    } catch (e) {
      logger.info('reset_token already exists')
    }

    try {
      run(`ALTER TABLE users ADD COLUMN reset_expires_at TEXT DEFAULT NULL`)
      logger.success('✅ Added reset_expires_at column')
    } catch (e) {
      logger.info('reset_expires_at already exists')
    }

    logger.success('✅ Password reset migration completed')
  } catch (error) {
    logger.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()