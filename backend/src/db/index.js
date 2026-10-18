import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import config from '../config/env.js'
import logger from '../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ═══════════════════════════════════════════════
// ✅ Ensure data directory exists
// ═══════════════════════════════════════════════
const dbPath = path.resolve(config.db.path)
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
  logger.info(`Created database directory: ${dbDir}`)
}

// ═══════════════════════════════════════════════
// ✅ Open database + performance pragmas
// ═══════════════════════════════════════════════
export const db = new Database(dbPath)

db.pragma('journal_mode = WAL')      // همزمانی write + crash-safe
db.pragma('synchronous = NORMAL')    // trade-off بهینه برای WAL
db.pragma('foreign_keys = ON')       // الزامی برای ON DELETE CASCADE
db.pragma('busy_timeout = 5000')     // جلوگیری از SQLITE_BUSY در همزمانی
db.pragma('cache_size = -64000')     // 64MB page cache
db.pragma('temp_store = MEMORY')     // جدول‌های موقت در RAM
db.pragma('mmap_size = 268435456')   // 256MB mmap برای read سریع

logger.success(`Database connected: ${dbPath}`)
logger.info(
  `SQLite pragmas → WAL: ${db.pragma('journal_mode', { simple: true })}, ` +
  `FK: ${db.pragma('foreign_keys', { simple: true })}`
)

// ═══════════════════════════════════════════════
// ✅ Helpers
// ═══════════════════════════════════════════════
export const exec = (sql) => db.exec(sql)
export const prepare = (sql) => db.prepare(sql)

export const get = (sql, params = []) => db.prepare(sql).get(...params)
export const all = (sql, params = []) => db.prepare(sql).all(...params)
export const run = (sql, params = []) => db.prepare(sql).run(...params)

export const transaction = (fn) => db.transaction(fn)()

export const close = () => {
  db.close()
  logger.info('Database closed')
}

export default { db, exec, prepare, get, all, run, transaction, close }