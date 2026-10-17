// backend/src/test/globalSetup.js
// ✅ این فایل فقط یک بار در ابتدای کل test run اجرا می‌شه
import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

export default async function () {
  const TEST_DB_PATH = path.resolve('./data/test.db')
  const dataDir = path.dirname(TEST_DB_PATH)

  // ✅ پاک کردن DB قبلی
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (fs.existsSync(TEST_DB_PATH)) {
    try { fs.unlinkSync(TEST_DB_PATH) } catch (e) { /* ignore */ }
  }

  // ✅ اجرای schema.sql مستقیم (بدون import migrate.js)
  const schemaPath = path.resolve('./src/db/schema.sql')
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`schema.sql not found at ${schemaPath}`)
  }
  const schema = fs.readFileSync(schemaPath, 'utf8')

  const db = new Database(TEST_DB_PATH)
  db.pragma('foreign_keys = ON')
  db.exec(schema)

  // ✅ اضافه کردن ستون sessions_invalidated_at (اگه نبود)
  const cols = db.prepare('PRAGMA table_info(users)').all()
  const hasSessionsCol = cols.some(c => c.name === 'sessions_invalidated_at')
  if (!hasSessionsCol) {
    try {
      db.exec('ALTER TABLE users ADD COLUMN sessions_invalidated_at TEXT DEFAULT NULL')
    } catch (e) { /* ignore */ }
  }

  db.close()
  console.log('🧪 Global setup: test DB created with schema')
}