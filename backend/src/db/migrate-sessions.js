// ═══════════════════════════════════════════════
// ✅ One-time migration: add sessions_invalidated_at
// Run: node src/db/migrate-sessions.js
// ═══════════════════════════════════════════════
import { db, exec } from './index.js'
import logger from '../utils/logger.js'

try {
  // ✅ چک کن ستون وجود داره یا نه
  const columns = db.prepare(`PRAGMA table_info(users)`).all()
  const hasColumn = columns.some(c => c.name === 'sessions_invalidated_at')

  if (hasColumn) {
    logger.info('✅ Column sessions_invalidated_at already exists. Nothing to do.')
  } else {
    exec(`ALTER TABLE users ADD COLUMN sessions_invalidated_at TEXT`)
    logger.success('✅ Added column sessions_invalidated_at to users')
  }

  process.exit(0)
} catch (error) {
  logger.error('Migration failed:', error.message)
  console.error(error)
  process.exit(1)
}