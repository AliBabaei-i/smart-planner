import type { ID, ISODate } from './common'

export interface ChecklistItem {
  id: ID
  text: string
  completed: boolean
}

export interface Note {
  id: ID
  title: string
  content: string
  color: string
  pinned: boolean
  archived: boolean
  tags: string[]
  checklist: ChecklistItem[]
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

export interface NotesState {
  notes: Note[]
}