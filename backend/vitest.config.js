import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // ✅ اجرای ترتیبی (نه موازی) تا SQLite قفل نشه
    fileParallelism: false,
    pool: 'forks',
    // ✅ env قبل از هر importی ست می‌شه
    env: {
      NODE_ENV: 'test',
      DB_PATH: './data/test.db',
      JWT_SECRET: 'test-secret-for-ci',
      JWT_REFRESH_SECRET: 'test-refresh-secret-for-ci'
    },
    // ✅ globalSetup فقط یک بار اجرا می‌شه (نه هر فایل تست)
    globalSetup: ['./src/test/globalSetup.js'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/test/**', 'src/db/migrate*.js']
    }
  }
})