import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface Note {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean
  archived: boolean
  tags: string[]
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface NotesState {
  notes: Note[]
}

const initialState: NotesState = { notes: [] }

// ✅ NOTE_COLORS برای NoteForm.jsx
export const NOTE_COLORS = [
  { id: 'yellow', color: '#fef08a', name: 'زرد' },
  { id: 'green', color: '#bbf7d0', name: 'سبز' },
  { id: 'blue', color: '#bfdbfe', name: 'آبی' },
  { id: 'purple', color: '#e9d5ff', name: 'بنفش' },
  { id: 'pink', color: '#fbcfe8', name: 'صورتی' },
  { id: 'orange', color: '#fed7aa', name: 'نارنجی' },
  { id: 'red', color: '#fecaca', name: 'قرمز' },
  { id: 'gray', color: '#e5e7eb', name: 'خاکستری' },
] as const

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action: PayloadAction<Partial<Note> & { title: string }>) => {
      state.notes.push({
        id: uuidv4(),
        title: action.payload.title,
        content: action.payload.content || '',
        color: action.payload.color || 'yellow',
        pinned: false,
        archived: false,
        tags: action.payload.tags || [],
        checklist: action.payload.checklist || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    },
    updateNote: (state, action: PayloadAction<Partial<Note> & { id: string }>) => {
      const idx = state.notes.findIndex(n => n.id === action.payload.id)
      if (idx !== -1) {
        state.notes[idx] = { ...state.notes[idx], ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(n => n.id !== action.payload)
    },
    togglePinNote: (state, action: PayloadAction<string>) => {
      const note = state.notes.find(n => n.id === action.payload)
      if (note) { note.pinned = !note.pinned; note.updatedAt = new Date().toISOString() }
    },
    toggleArchiveNote: (state, action: PayloadAction<string>) => {
      const note = state.notes.find(n => n.id === action.payload)
      if (note) { note.archived = !note.archived; note.updatedAt = new Date().toISOString() }
    },
    toggleChecklistItem: (state, action: PayloadAction<{ noteId: string; itemId: string }>) => {
      const note = state.notes.find(n => n.id === action.payload.noteId)
      if (note) {
        const item = note.checklist.find(c => c.id === action.payload.itemId)
        if (item) { item.completed = !item.completed; note.updatedAt = new Date().toISOString() }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase('sync/mergeNotes', (state, action: any) => {
      const remoteItems = action.payload?.items || []
      for (const remote of remoteItems) {
        if (remote.deletedAt || remote.deleted_at) {
          state.notes = state.notes.filter(n => n.id !== remote.id); continue
        }
        const idx = state.notes.findIndex(n => n.id === remote.id)
        if (idx === -1) state.notes.push(remote)
        else {
          const local = state.notes[idx]
          if (new Date(remote.updatedAt || 0) > new Date(local.updatedAt || 0)) {
            state.notes[idx] = { ...local, ...remote }
          }
        }
      }
    })
  }
})

export const { addNote, updateNote, deleteNote, togglePinNote, toggleArchiveNote, toggleChecklistItem } = notesSlice.actions

// ✅ تابع کمکی رنگ
export const getNoteColor = (colorId: string): string => {
  const found = NOTE_COLORS.find(c => c.id === colorId || c.color === colorId)
  return found?.color || '#fef08a'
}

export default notesSlice.reducer