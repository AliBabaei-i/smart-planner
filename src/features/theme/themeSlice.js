import { createSlice } from '@reduxjs/toolkit'

// ✅ تبدیل HEX به RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// ✅ محاسبه سایه‌های رنگی (light/dark shades)
const generateColorShades = (hex) => {
  const rgb = hexToRgb(hex)
  if (!rgb) return null

  const { r, g, b } = rgb

  // روشن‌تر کردن
  const lighten = (percent) => {
    return Math.round(255 - (255 - r) * (1 - percent / 100))
  }
  
  // تیره‌تر کردن
  const darken = (percent) => {
    return Math.round(r * (1 - percent / 100))
  }

  return {
    50: `rgb(${Math.round(r + (255 - r) * 0.9)}, ${Math.round(g + (255 - g) * 0.9)}, ${Math.round(b + (255 - b) * 0.9)})`,
    100: `rgb(${Math.round(r + (255 - r) * 0.8)}, ${Math.round(g + (255 - g) * 0.8)}, ${Math.round(b + (255 - b) * 0.8)})`,
    200: `rgb(${Math.round(r + (255 - r) * 0.6)}, ${Math.round(g + (255 - g) * 0.6)}, ${Math.round(b + (255 - b) * 0.6)})`,
    300: `rgb(${Math.round(r + (255 - r) * 0.4)}, ${Math.round(g + (255 - g) * 0.4)}, ${Math.round(b + (255 - b) * 0.4)})`,
    400: `rgb(${Math.round(r + (255 - r) * 0.2)}, ${Math.round(g + (255 - g) * 0.2)}, ${Math.round(b + (255 - b) * 0.2)})`,
    500: hex,
    600: `rgb(${Math.round(r * 0.9)}, ${Math.round(g * 0.9)}, ${Math.round(b * 0.9)})`,
    700: `rgb(${Math.round(r * 0.8)}, ${Math.round(g * 0.8)}, ${Math.round(b * 0.8)})`,
    800: `rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`,
    900: `rgb(${Math.round(r * 0.6)}, ${Math.round(g * 0.6)}, ${Math.round(b * 0.6)})`,
  }
}

// ✅ اعمال رنگ به CSS Variables (روی متغیرهای blue)
const applyPrimaryColor = (color) => {
  const shades = generateColorShades(color)
  if (!shades) return

  const root = document.documentElement
  // ✅ تغییر متغیرهای color-blue که Tailwind ازشون استفاده می‌کنه
  Object.entries(shades).forEach(([key, value]) => {
    root.style.setProperty(`--color-blue-${key}`, value)
  })
  
  try {
    localStorage.setItem('smart-planner-primary-color', color)
  } catch (e) {
    console.error('Error saving color:', e)
  }
}

// ✅ دریافت رنگ اولیه
const getInitialColor = () => {
  try {
    const saved = localStorage.getItem('smart-planner-primary-color')
    return saved || '#3b82f6'
  } catch {
    return '#3b82f6'
  }
}

const initialState = {
  mode: 'light',
  colors: {
    primary: getInitialColor(),
    secondary: '#8b5cf6', 
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  settings: {
    reducedMotion: false,
    highContrast: false,
    largeText: false
  }
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', state.mode === 'dark')
      localStorage.setItem('smart-planner-theme-mode', state.mode)
    },
    
    setTheme: (state, action) => {
      state.mode = action.payload
      document.documentElement.classList.toggle('dark', state.mode === 'dark')
      localStorage.setItem('smart-planner-theme-mode', state.mode)
    },
    
    // ✅ تغییر رنگ اصلی
    updateColors: (state, action) => {
      state.colors = { ...state.colors, ...action.payload }
      
      if (action.payload.primary) {
        applyPrimaryColor(action.payload.primary)
      }
    },
    
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload }
      localStorage.setItem('smart-planner-theme-settings', JSON.stringify(state.settings))
      
      if (action.payload.highContrast !== undefined) {
        document.documentElement.classList.toggle('high-contrast', action.payload.highContrast)
      }
      
      if (action.payload.largeText !== undefined) {
        document.documentElement.classList.toggle('large-text', action.payload.largeText)
      }
    },
    
    resetTheme: (state) => {
      state.colors = {
        primary: '#3b82f6',
        secondary: '#8b5cf6', 
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
      state.settings = {
        reducedMotion: false,
        highContrast: false,
        largeText: false
      }
      
      applyPrimaryColor('#3b82f6')
      document.documentElement.classList.remove('high-contrast', 'large-text')
      
      localStorage.removeItem('smart-planner-primary-color')
      localStorage.removeItem('smart-planner-theme-settings')
    }
  }
})

// ✅ اعمال رنگ اولیه هنگام بارگذاری
const initialColor = initialState.colors.primary

export const { 
  toggleTheme, 
  setTheme, 
  updateColors, 
  updateSettings, 
  resetTheme 
} = themeSlice.actions

// ✅ تابع export برای اعمال رنگ در ابتدای لود
export const initializeTheme = () => {
  applyPrimaryColor(initialColor)
  
  const savedMode = localStorage.getItem('smart-planner-theme-mode')
  if (savedMode === 'dark') {
    document.documentElement.classList.add('dark')
  }
}

export default themeSlice.reducer