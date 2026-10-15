import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

// ✅ رنگ‌های یادداشت
export const NOTE_COLORS = [
  { id: 'default', value: 'transparent', border: 'border-gray-200 dark:border-gray-700' },
  { id: 'yellow', value: '#fef3c7', dark: '#78350f', border: 'border-yellow-300 dark:border-yellow-800' },
  { id: 'green', value: '#d1fae5', dark: '#064e3b', border: 'border-green-300 dark:border-green-800' },
  { id: 'blue', value: '#dbeafe', dark: '#1e3a8a', border: 'border-blue-300 dark:border-blue-800' },
  { id: 'pink', value: '#fce7f3', dark: '#831843', border: 'border-pink-300 dark:border-pink-800' },
  { id: 'purple', value: '#e9d5ff', dark: '#581c87', border: 'border-purple-300 dark:border-purple-800' },
  { id: 'orange', value: '#fed7aa', dark: '#7c2d12', border: 'border-orange-300 dark:border-orange-800' }
]

// ✅ دریافت رنگ
export const getNoteColor = (colorId) => {
  return NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0]
}

// ✅ بارگذاری از localStorage
const getInitialState = () => {
  try {
    const saved = localStorage.getItem('smart-planner-notes')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Error loading notes:', e)
  }
  return {
    notes: []
  }
}

// ✅ ذخیره در localStorage
const saveToStorage = (state) => {
  try {
    localStorage.setItem('smart-planner-notes', JSON.stringify({
      notes: state.notes
    }))
  } catch (e) {
    console.error('Error saving notes:', e)
  }
}

const notesSlice = createSlice({
  name: 'notes',
  initialState: getInitialState(),
  reducers: {
    // ✅ افزودن یادداشت جدید
    addNote: (state, action) => {
      const newNote = {
        id: uuidv4(),
        title: action.payload.title || '',
        content: action.payload.content || '',
        colorId: action.payload.colorId || 'default',
        tags: action.payload.tags || [],
        checklist: action.payload.checklist || [],
        pinned: action.payload.pinned || false,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      state.notes.unshift(newNote)
      saveToStorage(state)
    },

    // ✅ ویرایش یادداشت
    updateNote: (state, action) => {
      const index = state.notes.findIndex(n => n.id === action.payload.id)
      if (index !== -1) {
        state.notes[index] = {
          ...state.notes[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        }
        saveToStorage(state)
      }
    },

    // ✅ حذف یادداشت
    deleteNote: (state, action) => {
      state.notes = state.notes.filter(n => n.id !== action.payload)
      saveToStorage(state)
    },

    // ✅ Pin/Unpin
    togglePinNote: (state, action) => {
      const note = state.notes.find(n => n.id === action.payload)
      if (note) {
        note.pinned = !note.pinned
        note.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },

    // ✅ آرشیو/خروج از آرشیو
    toggleArchiveNote: (state, action) => {
      const note = state.notes.find(n => n.id === action.payload)
      if (note) {
        note.archived = !note.archived
        note.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },

    // ✅ افزودن آیتم به checklist
    addChecklistItem: (state, action) => {
      const { noteId, text } = action.payload
      const note = state.notes.find(n => n.id === noteId)
      if (note) {
        if (!note.checklist) note.checklist = []
        note.checklist.push({
          id: uuidv4(),
          text,
          done: false
        })
        note.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },

    // ✅ تغییر وضعیت checklist item
    toggleChecklistItem: (state, action) => {
      const { noteId, itemId } = action.payload
      const note = state.notes.find(n => n.id === noteId)
      if (note && note.checklist) {
        const item = note.checklist.find(i => i.id === itemId)
        if (item) {
          item.done = !item.done
          note.updatedAt = new Date().toISOString()
          saveToStorage(state)
        }
      }
    },

    // ✅ حذف checklist item
    deleteChecklistItem: (state, action) => {
      const { noteId, itemId } = action.payload
      const note = state.notes.find(n => n.id === noteId)
      if (note && note.checklist) {
        note.checklist = note.checklist.filter(i => i.id !== itemId)
        note.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },

    // ✅ پاک کردن همه
    clearAllNotes: (state) => {
      state.notes = []
      saveToStorage(state)
    }
  },

  // ═══════════════════════════════════════════════
  // ✅ Extra Reducers — برای Sync
  // ═══════════════════════════════════════════════
  extraReducers: (builder) => {
    builder.addCase('sync/mergeNotes', (state, action) => {
      const remoteItems = action.payload?.items || []

      for (const remote of remoteItems) {
        if (remote.deletedAt || remote.deleted_at) {
          state.notes = state.notes.filter(n => n.id !== remote.id)
          continue
        }

        const index = state.notes.findIndex(n => n.id === remote.id)

        if (index === -1) {
          state.notes.unshift(remote)
        } else {
          const local = state.notes[index]
          const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
          const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime()

          if (remoteTime > localTime) {
            state.notes[index] = { ...local, ...remote }
          }
        }
      }

      saveToStorage(state)
    })
  }
})

export const {
  addNote,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleArchiveNote,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  clearAllNotes
} = notesSlice.actions

export default notesSlice.reducer