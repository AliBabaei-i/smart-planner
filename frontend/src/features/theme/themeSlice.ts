import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark' | 'system'

export const PRIMARY_PRESETS = {
  blue: {
    id: 'blue',
    shades: {
      50: '239 246 255', 100: '219 234 254', 200: '191 219 254',
      300: '147 197 253', 400: '96 165 250', 500: '59 130 246',
      600: '37 99 235', 700: '29 78 216', 800: '30 64 175', 900: '30 58 138', 950: '23 37 84',
    },
  },
  emerald: {
    id: 'emerald',
    shades: {
      50: '236 253 245', 100: '209 250 229', 200: '167 243 208',
      300: '110 231 183', 400: '52 211 153', 500: '16 185 129',
      600: '5 150 105', 700: '4 120 87', 800: '6 95 70', 900: '6 78 59', 950: '2 44 34',
    },
  },
  violet: {
    id: 'violet',
    shades: {
      50: '245 243 255', 100: '237 233 254', 200: '221 214 254',
      300: '196 181 253', 400: '167 139 250', 500: '139 92 246',
      600: '124 58 237', 700: '109 40 217', 800: '91 33 182', 900: '76 29 149', 950: '46 16 101',
    },
  },
  rose: {
    id: 'rose',
    shades: {
      50: '255 241 242', 100: '255 228 230', 200: '254 205 211',
      300: '253 164 175', 400: '251 113 133', 500: '244 63 94',
      600: '225 29 72', 700: '190 18 60', 800: '159 18 57', 900: '136 19 55', 950: '76 5 25',
    },
  },
  amber: {
    id: 'amber',
    shades: {
      50: '255 251 235', 100: '254 243 199', 200: '253 230 138',
      300: '252 211 77', 400: '251 191 36', 500: '245 158 11',
      600: '217 119 6', 700: '180 83 9', 800: '146 64 14', 900: '120 53 15', 950: '69 26 3',
    },
  },
} as const

export type PrimaryColorId = keyof typeof PRIMARY_PRESETS

export interface ThemeState {
  mode: ThemeMode
  primaryColor: PrimaryColorId
}

const initialState: ThemeState = {
  mode: 'system',
  primaryColor: 'blue', // رنگ آبی پیش‌فرض
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload
      localStorage.setItem('smart-planner-theme', action.payload)
    },
    toggleTheme(state) {
      const isDark = document.documentElement.classList.contains('dark')
      state.mode = isDark ? 'light' : 'dark'
      localStorage.setItem('smart-planner-theme', state.mode)
    },
    setPrimaryColor(state, action: PayloadAction<PrimaryColorId>) {
      state.primaryColor = action.payload
      localStorage.setItem('smart-planner-primary-color', action.payload)
    },
    resetTheme() {
      return initialState
    },
  },
})

export const { setThemeMode, toggleTheme, setPrimaryColor, resetTheme } = themeSlice.actions

// ✅ تابع initializeTheme برای سازگاری با App.jsx
export const initializeTheme = () => {
  const mode = (localStorage.getItem('smart-planner-theme') as ThemeMode) || 'system'
  const primaryColor = (localStorage.getItem('smart-planner-primary-color') as PrimaryColorId) || 'blue'
  
  const root = document.documentElement
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const isDark = mode === 'dark' || (mode === 'system' && media.matches)
  
  root.classList.toggle('dark', isDark)
  root.dataset.theme = isDark ? 'dark' : 'light'
  root.style.colorScheme = isDark ? 'dark' : 'light'
  
  const preset = PRIMARY_PRESETS[primaryColor] || PRIMARY_PRESETS.blue
  Object.entries(preset.shades).forEach(([shade, rgb]) => {
    root.style.setProperty(`--primary-${shade}`, rgb)
  })
}

export const selectThemeMode = (state: { theme: ThemeState }) => state.theme.mode
export const selectPrimaryColor = (state: { theme: ThemeState }) => state.theme.primaryColor

export default themeSlice.reducer