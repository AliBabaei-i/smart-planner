import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import type { Task, TasksState } from '../../types/tasks'
import { getLocalDateStr } from '../../utils/dateHelpers'

const initialState: TasksState = {
  tasks: [],
  availableTags: [],
  loading: false,
  error: null,
  currentTask: null,
}

// ✅ helper: چک تکرار
const shouldRecurToday = (task: Task, today: string): boolean => {
  if (!task.recurring) return false
  if (task.recurringEndDate && task.recurringEndDate < today) return false
  if (task.completed) return false
  return true
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Partial<Task> & { title: string }>) => {
      const newTask: Task = {
        id: uuidv4(),
        title: action.payload.title,
        description: action.payload.description || '',
        projectId: action.payload.projectId || null,
        priority: action.payload.priority || 'medium',
        status: action.payload.status || 'todo',
        dueDate: action.payload.dueDate || null,
        dueTime: action.payload.dueTime || null,
        timeEstimate: action.payload.timeEstimate || null,
        actualTime: action.payload.actualTime || 0,
        completed: action.payload.completed || false,
        subtasks: action.payload.subtasks || [],
        notes: action.payload.notes || '',
        tags: action.payload.tags || [],
        recurring: action.payload.recurring || null,
        recurringEndDate: action.payload.recurringEndDate || null,
        parentTaskId: action.payload.parentTaskId || null,
        financialCost: action.payload.financialCost || null,
        financialCategory: action.payload.financialCategory || null,
        financialTransactionId: action.payload.financialTransactionId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      state.tasks.push(newTask)
      // ✅ بروزرسانی تگ‌ها
      for (const tag of newTask.tags) {
        if (!state.availableTags.includes(tag)) {
          state.availableTags.push(tag)
        }
      }
    },

    updateTask: (state, action: PayloadAction<Partial<Task> & { id: string }>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        }
        for (const tag of state.tasks[index].tags) {
          if (!state.availableTags.includes(tag)) {
            state.availableTags.push(tag)
          }
        }
      }
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
    },

    toggleTaskStatus: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(t => t.id === action.payload)
      if (task) {
        task.completed = !task.completed
        task.status = task.completed ? 'completed' : 'todo'
        task.updatedAt = new Date().toISOString()
      }
    },

    addSubtask: (state, action: PayloadAction<{ taskId: string; title: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) {
        task.subtasks.push({
          id: uuidv4(),
          title: action.payload.title,
          completed: false,
          createdAt: new Date().toISOString(),
        })
        task.updatedAt = new Date().toISOString()
      }
    },

    updateSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string; title: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) {
        const st = task.subtasks.find(s => s.id === action.payload.subtaskId)
        if (st) {
          st.title = action.payload.title
          task.updatedAt = new Date().toISOString()
        }
      }
    },

    deleteSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) {
        task.subtasks = task.subtasks.filter(s => s.id !== action.payload.subtaskId)
        task.updatedAt = new Date().toISOString()
      }
    },

    toggleSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) {
        const subtask = task.subtasks.find(st => st.id === action.payload.subtaskId)
        if (subtask) {
          subtask.completed = !subtask.completed
          task.updatedAt = new Date().toISOString()
        }
      }
    },

    updateTaskNotes: (state, action: PayloadAction<{ id: string; notes: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id)
      if (task) {
        task.notes = action.payload.notes
        task.updatedAt = new Date().toISOString()
      }
    },

    addTagToTask: (state, action: PayloadAction<{ taskId: string; tag: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task && !task.tags.includes(action.payload.tag)) {
        task.tags.push(action.payload.tag)
        task.updatedAt = new Date().toISOString()
        if (!state.availableTags.includes(action.payload.tag)) {
          state.availableTags.push(action.payload.tag)
        }
      }
    },

    removeTagFromTask: (state, action: PayloadAction<{ taskId: string; tag: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) {
        task.tags = task.tags.filter(tg => tg !== action.payload.tag)
        task.updatedAt = new Date().toISOString()
      }
    },

    // ✅ وصل کردن تراکنش مالی به تسک
    linkTransactionToTask: (state, action: PayloadAction<{ taskId: string; transactionId: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) {
        task.financialTransactionId = action.payload.transactionId
        task.updatedAt = new Date().toISOString()
      }
    },

    // ✅ ساخت تسک‌های تکرارشونده
    generateRecurringTasks: (state) => {
      const today = getLocalDateStr()
      const newTasks: Task[] = []

      for (const task of state.tasks) {
        if (!task.recurring || task.parentTaskId) continue
        if (!shouldRecurToday(task, today)) continue

        // چک کن برای امروز ساخته نشده باشه
        const alreadyExists = state.tasks.some(
          t => t.parentTaskId === task.id && t.dueDate === today
        )
        if (alreadyExists) continue

        // اگه تسک اصلی هنوز برای امروز یا آینده است، نیازی به ساخت نیست
        if (task.dueDate && task.dueDate >= today && !task.completed) continue

        newTasks.push({
          ...task,
          id: uuidv4(),
          dueDate: today,
          completed: false,
          status: 'todo',
          parentTaskId: task.id,
          subtasks: task.subtasks.map(st => ({
            ...st,
            id: uuidv4(),
            completed: false,
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      if (newTasks.length > 0) {
        state.tasks.push(...newTasks)
        console.log(`🔁 Generated ${newTasks.length} recurring task(s) for ${today}`)
      }
    },

    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase('sync/mergeTasks', (state, action: any) => {
      const remoteItems = action.payload?.items || []
      for (const remote of remoteItems) {
        if (remote.deletedAt || remote.deleted_at) {
          state.tasks = state.tasks.filter(t => t.id !== remote.id)
          continue
        }
        const index = state.tasks.findIndex(t => t.id === remote.id)
        if (index === -1) {
          state.tasks.push(remote)
        } else {
          const local = state.tasks[index]
          const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
          const remoteTime = new Date(remote.updatedAt || remote.created_at || 0).getTime()
          if (remoteTime > localTime) {
            state.tasks[index] = { ...local, ...remote }
          }
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
  addSubtask,
  updateSubtask,
  deleteSubtask,
  toggleSubtask,
  updateTaskNotes,
  addTagToTask,
  removeTagFromTask,
  linkTransactionToTask,
  generateRecurringTasks,
  setCurrentTask,
} = tasksSlice.actions

export default tasksSlice.reducer