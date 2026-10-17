// backend/src/test/setup.js
import fs from 'fs'
import path from 'path'
import { beforeAll, afterAll } from 'vitest'

// ✅ پاک کردن DB تست قبل از شروع
const TEST_DB_PATH = path.resolve('./data/test.db')

beforeAll(() => {
  const dataDir = path.dirname(TEST_DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH)
  }
  process.env.DB_PATH = TEST_DB_PATH
  process.env.JWT_SECRET = 'test-secret-for-ci'
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-ci'
  process.env.NODE_ENV = 'test'
})

afterAll(() => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH)
  }
})