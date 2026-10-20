import type { ID, ISODate } from './common'

export interface UserSettings {
  theme?: string
  language?: string
  notifications?: boolean
  [key: string]: any
}

export interface User {
  id: ID
  email: string
  name: string
  settings?: UserSettings
  created_at?: ISODate
  last_login_at?: ISODate
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}