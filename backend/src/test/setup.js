// backend/src/test/setup.js
// ✅ این فایل برای هر فایل تست اجرا می‌شه — فقط env رو چک می‌کنه

if (process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ NODE_ENV is not "test" — tests may fail')
}

if (!process.env.DB_PATH) {
  console.warn('⚠️ DB_PATH is not set')
}