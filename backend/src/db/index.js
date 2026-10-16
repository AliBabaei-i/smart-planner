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
const dbDir = path.dirname(path.resolve(config.db.path))
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
  logger.info(`Created database directory: ${dbDir}`)
}

// ═══════════════════════════════════════════════
// ✅ Open database
// ═══════════════════════════════════════════════
export const db = new Database(path.resolve(config.db.path))

// ✅ تنظیمات performance
db.pragma('journal_mode = WAL')      // Write-Ahead Logging (سریع‌تر)
db.pragma('synchronous = NORMAL')
db.pragma('foreign_keys = ON')
db.pragma('cache_size = -64000')     // 64MB cache

logger.success(`Database connected: ${path.resolve(config.db.path)}`)

// ═══════════════════════════════════════════════
// ✅ Helper functions
// ═══════════════════════════════════════════════

// ✅ اجرای SQL
export const exec = (sql) => db.exec(sql)

// ✅ prepare statement
export const prepare = (sql) => db.prepare(sql)

// ✅ یه ردیف
export const get = (sql, params = []) => {
  return db.prepare(sql).get(...params)
}

// ✅ چند ردیف
export const all = (sql, params = []) => {
  return db.prepare(sql).all(...params)
}

// ✅ اجرا (insert/update/delete)
export const run = (sql, params = []) => {
  return db.prepare(sql).run(...params)
}

// ✅ Transaction
export const transaction = (fn) => {
  return db.transaction(fn)()
}

// ✅ بستن
export const close = () => {
  db.close()
  logger.info('Database closed')
}

export default { db, exec, prepare, get, all, run, transaction, close }