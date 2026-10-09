import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  tasks: [],
  availableTags: [],
  loading: false,
  error: null,
  currentTask: null
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // ✅ افزودن تسک جدید
    addTask: (state, action) => {
      const tags = action.payload.tags || []
      
      tags.forEach(tag => {
        if (!state.availableTags.includes(tag)) {
          state.availableTags.push(tag)
        }
      })

      const newTask = {
        id: uuidv4(),
        title: action.payload.title,
        description: action.payload.description || '',
        projectId: action.payload.projectId,
        priority: action.payload.priority || 'medium',
        status: 'todo',
        dueDate: action.payload.dueDate || null,
        dueTime: action.payload.dueTime !== undefined && action.payload.dueTime !== null && action.payload.dueTime !== '' 
          ? parseInt(action.payload.dueTime) 
          : null,
        timeEstimate: action.payload.timeEstimate 
          ? parseInt(action.payload.timeEstimate) 
          : null,
        actualTime: 0,
        completed: false,
        subtasks: action.payload.subtasks || [],
        notes: '',
        tags: tags,
        // ✅ فیلدهای تکرار
        recurring: action.payload.recurring || null,
        recurringEndDate: action.payload.recurringEndDate || null,
        parentTaskId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      state.tasks.push(newTask)
    },
    
    // ✅ آپدیت تسک
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id)
      if (index !== -1) {
        if (action.payload.tags) {
          action.payload.tags.forEach(tag => {
            if (!state.availableTags.includes(tag)) {
              state.availableTags.push(tag)
            }
          })
        }

        state.tasks[index] = {
          ...state.tasks[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        }
      }
    },
    
    // ✅ حذف تسک
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload)
    },
    
    // ✅ تغییر وضعیت تسک
    toggleTaskStatus: (state, action) => {
      const task = state.tasks.find(task => task.id === action.payload)
      if (task) {
        task.completed = !task.completed
        task.status = task.completed ? 'completed' : 'todo'
        task.updatedAt = new Date().toISOString()
      }
    },
    
    // ✅ افزودن زمان واقعی
    addActualTime: (state, action) => {
      const { taskId, minutes } = action.payload
      const task = state.tasks.find(task => task.id === taskId)
      if (task) {
        task.actualTime = (task.actualTime || 0) + minutes
        task.updatedAt = new Date().toISOString()
      }
    },

    // ✅ افزودن زیرتسک
    addSubtask: (state, action) => {
      const { taskId, title } = action.payload
      const task = state.tasks.find(task => task.id === taskId)
      if (task) {
        if (!task.subtasks) task.subtasks = []
        task.subtasks.push({
          id: uuidv4(),
          title,
          completed: false,
          createdAt: new Date().toISOString()
        })
        task.updatedAt = new Date().toISOString()
      }
    },

    // ✅ تغییر وضعیت زیرتسک
    toggleSubtask: (state, action) => {
      const { taskId, subtaskId } = action.payload
      const task = state.tasks.find(task => task.id === taskId)
      if (task && task.subtasks) {
        const subtask = task.subtasks.find(st => st.id === subtaskId)
        if (subtask) {
          subtask.completed = !subtask.completed
          task.updatedAt = new Date().toISOString()
        }
      }
    },

    // ✅ ویرایش زیرتسک
    updateSubtask: (state, action) => {
      const { taskId, subtaskId, title } = action.payload
      const task = state.tasks.find(task => task.id === taskId)
      if (task && task.subtasks) {
        const subtask = task.subtasks.find(st => st.id === subtaskId)
        if (subtask) {
          subtask.title = title
          task.updatedAt = new Date().toISOString()
        }
      }
    },

    // ✅ حذف زیرتسک
    deleteSubtask: (state, action) => {
      const { taskId, subtaskId } = action.payload
      const task = state.tasks.find(task => task.id === taskId)
      if (task && task.subtasks) {
        task.subtasks = task.subtasks.filter(st => st.id !== subtaskId)
        task.updatedAt = new Date().toISOString()
      }
    },

    // ✅ آپدیت یادداشت
    updateTaskNotes: (state, action) => {
      const { taskId, notes } = action.payload
      const task = state.tasks.find(task => task.id === taskId)
      if (task) {
        task.notes = notes
        task.updatedAt = new Date().toISOString()
      }
    },

    // ✅ بررسی و ساخت تسک‌های تکرارشونده
    generateRecurringTasks: (state) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const recurringTasks = state.tasks.filter(t => 
        t.recurring && 
        !t.parentTaskId &&
        t.dueDate
      )

      recurringTasks.forEach(parentTask => {
        const originalDate = new Date(parentTask.dueDate)
        originalDate.setHours(0, 0, 0, 0)
        
        // بررسی تاریخ پایان
        if (parentTask.recurringEndDate) {
          const endDate = new Date(parentTask.recurringEndDate)
          endDate.setHours(0, 0, 0, 0)
          if (today > endDate) return
        }

        // محاسبه تاریخ بعدی
        let nextDate = new Date(originalDate)
        let iterations = 0
        const maxIterations = 365 // جلوگیری از حلقه بی‌نهایت
        
        while (nextDate < today && iterations < maxIterations) {
          iterations++
          switch (parentTask.recurring) {
            case 'daily':
              nextDate.setDate(nextDate.getDate() + 1)
              break
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7)
              break
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1)
              break
            default:
              return
          }
        }

        // چک کردن که آیا نسخه امروز وجود دارد
        const nextDateStr = nextDate.toDateString()
        const existsToday = state.tasks.some(t => 
          t.parentTaskId === parentTask.id && 
          t.dueDate &&
          new Date(t.dueDate).toDateString() === nextDateStr
        )

        // اگر نسخه امروز وجود ندارد و تاریخ بعدی امروز است، بساز
        if (!existsToday && nextDate.toDateString() === today.toDateString()) {
          state.tasks.push({
            ...parentTask,
            id: uuidv4(),
            parentTaskId: parentTask.id,
            completed: false,
            status: 'todo',
            actualTime: 0,
            dueDate: nextDate.toISOString().split('T')[0],
            subtasks: (parentTask.subtasks || []).map(st => ({
              id: uuidv4(),
              title: st.title,
              completed: false,
              createdAt: new Date().toISOString()
            })),
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        }
      })
    },

    // ✅ افزودن تگ به تسک
    addTagToTask: (state, action) => {
      const { taskId, tag } = action.payload
      const task = state.tasks.find(task => task.id === taskId)
      if (task) {
        if (!task.tags) task.tags = []
        if (!task.tags.includes(tag)) {
          task.tags.push(tag)
          task.updatedAt = new Date().toISOString()
        }
      }
      if (!state.availableTags.includes(tag)) {
        state.availableTags.push(tag)
      }
    },

    // ✅ حذف تگ از تسک
    removeTagFromTask: (state, action) => {
      const { taskId, tag } = action.payload
      const task = state.tasks.find(task => task.id === taskId)
      if (task && task.tags) {
        task.tags = task.tags.filter(t => t !== tag)
        task.updatedAt = new Date().toISOString()
      }
    },

    // ✅ حذف تگ از لیست موجود
    removeAvailableTag: (state, action) => {
      state.availableTags = state.availableTags.filter(t => t !== action.payload)
      state.tasks.forEach(task => {
        if (task.tags) {
          task.tags = task.tags.filter(t => t !== action.payload)
        }
      })
    }
  }
})

export const {
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  addActualTime,
  addSubtask,
  toggleSubtask,
  updateSubtask,
  deleteSubtask,
  updateTaskNotes,
  generateRecurringTasks,
  addTagToTask,
  removeTagFromTask,
  removeAvailableTag
} = tasksSlice.actions

export default tasksSlice.reducer