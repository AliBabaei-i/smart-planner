/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // ✅ هر VITE_* دیگه‌ای که داری اینجا اضافه کن
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}