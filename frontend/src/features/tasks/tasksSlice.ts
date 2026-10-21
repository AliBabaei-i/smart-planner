import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import type { Task, Subtask, TaskPriority, TaskStatus } from '../../types/tasks'

export interface TasksState {
  tasks: Task[]
  availableTags: string[]
  currentTask: Task | null
  loading: boolean
  error: string | null
}

const initialState: TasksState = {
  tasks: [],
  availableTags: [],
  currentTask: null,
  loading: false,
  error: null,
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (
      state,
      action: PayloadAction<Partial<Task> & { title: string; projectId: string }>
    ) => {
      const p = action.payload
      const newTask: Task = {
        id: p.id || uuidv4(),
        title: p.title,
        description: p.description || '',
        projectId: p.projectId,
        priority: (p.priority as TaskPriority) || 'medium',
        status: (p.status as TaskStatus) || 'todo',
        completed: p.completed || false,
        dueDate: p.dueDate || null,
        dueTime: p.dueTime ?? null,
        timeEstimate: p.timeEstimate || null,
        actualTime: p.actualTime || 0,
        tags: p.tags || [],
        subtasks: p.subtasks || [],
        notes: p.notes || '',
        recurring: p.recurring || null,
        recurringEndDate: p.recurringEndDate || null,
        parentTaskId: p.parentTaskId || null,
        financialCost: p.financialCost || null,
        financialCategory: p.financialCategory || null,
        financialTransactionId: p.financialTransactionId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Task
      state.tasks.push(newTask)
      for (const tag of newTask.tags) {
        if (!state.availableTags.includes(tag)) state.availableTags.push(tag)
      }
    },

    updateTask: (state, action: PayloadAction<Partial<Task> & { id: string }>) => {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id)
      if (idx === -1) return
      state.tasks[idx] = {
        ...state.tasks[idx],
        ...action.payload,
        updatedAt: new Date().toISOString(),
      }
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload)
    },

    toggleTaskStatus: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((t) => t.id === action.payload)
      if (!task) return
      task.completed = !task.completed
      task.status = task.completed ? 'completed' : 'todo'
      task.updatedAt = new Date().toISOString()
    },

    updateTaskNotes: (
      state,
      action: PayloadAction<{ taskId: string; notes: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId)
      if (!task) return
      task.notes = action.payload.notes
      task.updatedAt = new Date().toISOString()
    },

    addSubtask: (
      state,
      action: PayloadAction<{ taskId: string; title: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId)
      if (!task) return
      if (!task.subtasks) task.subtasks = []
      task.subtasks.push({
        id: uuidv4(),
        title: action.payload.title,
        completed: false,
        createdAt: new Date().toISOString(),
      } as Subtask)
      task.updatedAt = new Date().toISOString()
    },

    toggleSubtask: (
      state,
      action: PayloadAction<{ taskId: string; subtaskId: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId)
      const st = task?.subtasks?.find((s) => s.id === action.payload.subtaskId)
      if (!st) return
      st.completed = !st.completed
      if (task) task.updatedAt = new Date().toISOString()
    },

    deleteSubtask: (
      state,
      action: PayloadAction<{ taskId: string; subtaskId: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId)
      if (!task?.subtasks) return
      task.subtasks = task.subtasks.filter(
        (s) => s.id !== action.payload.subtaskId
      )
      task.updatedAt = new Date().toISOString()
    },

    updateSubtask: (
      state,
      action: PayloadAction<{
        taskId: string
        subtaskId: string
        title: string
      }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId)
      const st = task?.subtasks?.find((s) => s.id === action.payload.subtaskId)
      if (!st) return
      st.title = action.payload.title
      if (task) task.updatedAt = new Date().toISOString()
    },

    addTagToTask: (
      state,
      action: PayloadAction<{ taskId: string; tag: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId)
      if (!task || task.tags.includes(action.payload.tag)) return
      task.tags.push(action.payload.tag)
      task.updatedAt = new Date().toISOString()
      if (!state.availableTags.includes(action.payload.tag)) {
        state.availableTags.push(action.payload.tag)
      }
    },

    removeTagFromTask: (
      state,
      action: PayloadAction<{ taskId: string; tag: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId)
      if (!task) return
      task.tags = task.tags.filter((x) => x !== action.payload.tag)
      task.updatedAt = new Date().toISOString()
    },

    linkTransactionToTask: (
      state,
      action: PayloadAction<{ taskId: string; transactionId: string }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId)
      if (!task) return
      task.financialTransactionId = action.payload.transactionId
      task.updatedAt = new Date().toISOString()
    },

    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload
    },

    generateRecurringTasks: (state) => {
      const today = new Date().toISOString().split('T')[0]
      const recurringParents = state.tasks.filter(
        (t) => t.recurring && t.completed && !t.parentTaskId
      )
      for (const parent of recurringParents) {
        const exists = state.tasks.some(
          (t) => t.parentTaskId === parent.id && t.dueDate === today
        )
        if (exists) continue
        const newChild: Task = {
          ...parent,
          id: uuidv4(),
          completed: false,
          status: 'todo',
          dueDate: today,
          actualTime: 0,
          parentTaskId: parent.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        state.tasks.push(newChild)
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    // ✅ برای backup/restore — کل state را جایگزین می‌کند
    __restore__: (_state, action: PayloadAction<TasksState>) => action.payload,
  },

  extraReducers: (builder) => {
    // ✅ merge از sync (اگر داری، دست نزن — کد فعلی خودت را نگه دار)
    builder.addCase('sync/mergeTasks', (state, action: any) => {
      const items = action.payload?.items || []
      for (const remote of items) {
        if (remote.deletedAt || remote.deleted_at) {
          state.tasks = state.tasks.filter((t) => t.id !== remote.id)
          continue
        }
        const idx = state.tasks.findIndex((t) => t.id === remote.id)
        if (idx === -1) {
          state.tasks.push(remote)
        } else {
          const local = state.tasks[idx]
          const lt = new Date(local.updatedAt || 0).getTime()
          const rt = new Date(remote.updatedAt || 0).getTime()
          if (rt > lt) state.tasks[idx] = { ...local, ...remote }
        }
      }
    })
  },
})

export const {
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  updateTaskNotes,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateSubtask,
  addTagToTask,
  removeTagFromTask,
  linkTransactionToTask,
  setCurrentTask,
  generateRecurringTasks,
  setLoading,
  setError,
  __restore__,
} = tasksSlice.actions

// ═══════════════════════════════════════════════
// ✅ Selectors
// ═══════════════════════════════════════════════
const selectTasksState = (state: { tasks: TasksState }) => state.tasks

export const selectAllTasks = createSelector(
  [selectTasksState],
  (s) => s.tasks
)

export const selectCompletedTasks = createSelector(
  [selectAllTasks],
  (tasks) => tasks.filter((t) => t.completed)
)

export const selectTaskById = createSelector(
  [selectAllTasks, (_: any, id: string) => id],
  (tasks, id) => tasks.find((t) => t.id === id)
)

export const selectTasksByProject = createSelector(
  [selectAllTasks, (_: any, projectId: string) => projectId],
  (tasks, projectId) => tasks.filter((t) => t.projectId === projectId)
)

export default tasksSlice.reducer